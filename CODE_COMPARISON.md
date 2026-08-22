# Code Comparison: Node.js vs Laravel

## Authentication Endpoint Comparison

### Register User

#### Node.js (Express)
```javascript
app.post('/auth/register', async (req, res) => {
    try {
        const { username, password, email, role = 'user', adminSecret } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        let finalRole = 'user';
        if (role === 'admin') {
            if (adminSecret !== ADMIN_REGISTRATION_SECRET) {
                return res.status(403).json({ message: 'Invalid admin registration secret.' });
            }
            finalRole = 'admin';
        }

        const pool = await poolPromise;
        const existing = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT id FROM Users WHERE username = @username');

        if (existing.recordset.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)  // Plain text!
            .input('email', sql.NVarChar, email || null)
            .input('role', sql.NVarChar, finalRole)
            .query('INSERT INTO Users (username, password, email, role) VALUES (@username, @password, @email, @role)');

        res.json({ message: `${finalRole === 'admin' ? 'Admin' : 'User'} registered successfully` });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
});
```

#### Laravel (PHP)
```php
public function register(Request $request)
{
    $request->validate([
        'username' => 'required|string|max:255|unique:users',
        'password' => 'required|string|min:6',
        'email' => 'nullable|email|max:255',
        'role' => 'nullable|string|in:user,admin',
        'adminSecret' => 'nullable|string',
    ]);

    $role = 'user';
    if ($request->role === 'admin') {
        if ($request->adminSecret !== config('app.admin_registration_secret')) {
            return response()->json(['message' => 'Invalid admin registration secret.'], 403);
        }
        $role = 'admin';
    }

    $user = User::create([
        'username' => $request->username,
        'password' => Hash::make($request->password),  // Hashed!
        'email' => $request->email,
        'role' => $role,
    ]);

    return response()->json([
        'message' => ($role === 'admin' ? 'Admin' : 'User') . ' registered successfully'
    ]);
}
```

### Login User

#### Node.js (Express)
```javascript
app.post('/auth/login', async (req, res) => {
    try {
        const { username, password, role = 'user' } = req.body;
        
        if (role === 'admin') {
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                return res.json({ 
                    token: 'admin-dummy-token',  // Dummy token!
                    role: 'admin', 
                    user: { username: ADMIN_USERNAME } 
                });
            }
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)  // Plain text comparison!
            .query('SELECT id, username, role FROM Users WHERE username = @username AND password = @password');

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.recordset[0];
        res.json({ 
            token: 'user-dummy-token',  // Dummy token!
            role: 'user', 
            user: { id: user.id, username: user.username } 
        });
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
});
```

#### Laravel (PHP)
```php
public function login(Request $request)
{
    $request->validate([
        'username' => 'required|string',
        'password' => 'required|string',
        'role' => 'nullable|string|in:user,admin',
    ]);

    $user = User::where('username', $request->username)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    if ($request->role === 'admin' && $user->role !== 'admin') {
        return response()->json(['message' => 'Invalid admin credentials.'], 401);
    }

    $token = $user->createToken('auth-token')->plainTextToken;  // Real token!

    return response()->json([
        'token' => $token,
        'role' => $user->role,
        'user' => [
            'id' => $user->id,
            'username' => $user->username,
        ],
    ]);
}
```

## CRUD Endpoint Comparison

### Get Village Data

#### Node.js (Express)
```javascript
app.get('/village', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT TOP 1 * FROM Village;
                SELECT * FROM VillageImages WHERE village_id = (SELECT TOP 1 id FROM Village);
                SELECT * FROM Achievements WHERE village_id = (SELECT TOP 1 id FROM Village);
                SELECT * FROM SpecialPersonalities WHERE village_id = (SELECT TOP 1 id FROM Village);
            `);
        
        const village = result.recordsets[0][0];
        if (!village) {
            return res.json(villageData);  // Fallback dummy data
        }

        const orderedImages = (result.recordsets[1] || []).sort((a, b) => a.id - b.id);
        const images = orderedImages.map(img => img.image_url);
        const villageImages = orderedImages.map((img) => ({ id: img.id, url: img.image_url }));
        const achievements = result.recordsets[2];
        const special_persons = result.recordsets[3];

        res.json({
            ...village,
            images,
            villageImages,
            achievements,
            special_persons,
            history: {
                english: village.history_en,
                gujarati: village.history_gu
            }
        });
    } catch (err) {
        console.error('SQL Error:', err);
        res.json(villageData);  // Fallback on error
    }
});
```

#### Laravel (PHP)
```php
public function show()
{
    $village = Village::with([
        'images' => fn($q) => $q->orderBy('id'),
        'achievements',
        'specialPersonalities'
    ])->first();

    if (!$village) {
        return response()->json($this->getFallbackData());
    }

    return response()->json([
        'id' => $village->id,
        'name' => $village->name,
        'taluka' => $village->taluka,
        'district' => $village->district,
        'state' => $village->state,
        'area' => $village->area,
        'total_households' => $village->total_households,
        'description' => $village->description,
        'images' => $village->images->pluck('image_url')->toArray(),
        'villageImages' => $village->images->map(fn($img) => [
            'id' => $img->id,
            'url' => $img->image_url
        ])->toArray(),
        'achievements' => $village->achievements,
        'special_persons' => $village->specialPersonalities,
        'history' => [
            'english' => $village->history_en,
            'gujarati' => $village->history_gu,
        ],
    ]);
}
```

### Update Village (Admin)

#### Node.js (Express)
```javascript
app.post('/village/update', async (req, res) => {
    try {
        const { name, taluka, district, state, area, total_households, description, history_en, history_gu } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('taluka', sql.NVarChar, taluka)
            .input('district', sql.NVarChar, district)
            .input('state', sql.NVarChar, state)
            .input('area', sql.NVarChar, area)
            .input('households', sql.NVarChar, total_households)
            .input('desc', sql.NVarChar, description)
            .input('hen', sql.NVarChar, history_en)
            .input('hgu', sql.NVarChar, history_gu)
            .query(`
                UPDATE Village SET 
                name = @name, taluka = @taluka, district = @district, state = @state, 
                area = @area, total_households = @households, description = @desc,
                history_en = @hen, history_gu = @hgu
                WHERE id = (SELECT TOP 1 id FROM Village)
            `);
        res.json({ message: 'Village updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```

#### Laravel (PHP)
```php
public function update(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'taluka' => 'nullable|string|max:255',
        'district' => 'nullable|string|max:255',
        'state' => 'nullable|string|max:255',
        'area' => 'nullable|string|max:100',
        'total_households' => 'nullable|string|max:100',
        'description' => 'nullable|string',
        'history_en' => 'nullable|string',
        'history_gu' => 'nullable|string',
    ]);

    $village = Village::firstOrFail();
    $village->update($request->all());

    return response()->json(['message' => 'Village updated successfully']);
}
```

## File Upload Comparison

### Upload Village Image

#### Node.js (Express)
```javascript
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        fs.ensureDirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

app.post('/village/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        const pool = await poolPromise;
        
        await pool.request()
            .input('vId', sql.Int, 1)
            .input('url', sql.NVarChar, imageUrl)
            .query('INSERT INTO VillageImages (village_id, image_url) VALUES (@vId, @url)');
            
        res.json({ message: 'Image uploaded successfully', imageUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```

#### Laravel (PHP)
```php
public function uploadImage(Request $request)
{
    $request->validate([
        'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    $village = Village::firstOrFail();

    $path = $request->file('image')->store('uploads', 'public');
    $imageUrl = url('storage/' . $path);

    $village->images()->create([
        'image_url' => $imageUrl,
    ]);

    return response()->json([
        'message' => 'Image uploaded successfully',
        'imageUrl' => $imageUrl,
    ]);
}
```

## Database Query Comparison

### Get Census Data

#### Node.js (MSSQL)
```javascript
app.get('/census', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM Census WHERE village_id = (SELECT TOP 1 id FROM Village)');
        
        if (result.recordset.length === 0) {
            return res.json(censusData);  // Fallback
        }
        res.json(result.recordset);
    } catch (err) {
        res.json(censusData);  // Fallback on error
    }
});
```

#### Laravel (MySQL)
```php
public function index()
{
    $village = Village::first();
    
    if (!$village) {
        return response()->json($this->getFallbackData());
    }

    $census = Census::where('village_id', $village->id)->get();

    if ($census->isEmpty()) {
        return response()->json($this->getFallbackData());
    }

    return response()->json($census);
}
```

### Add Census Record

#### Node.js (MSSQL)
```javascript
app.post('/census/add', async (req, res) => {
    try {
        const { category, total, male, female } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('cat', sql.NVarChar, category)
            .input('total', sql.Int, total)
            .input('male', sql.Int, male)
            .input('female', sql.Int, female)
            .query('INSERT INTO Census (village_id, category, total, male, female) VALUES ((SELECT TOP 1 id FROM Village), @cat, @total, @male, @female)');
        res.json({ message: 'Census added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```

#### Laravel (MySQL)
```php
public function store(Request $request)
{
    $request->validate([
        'category' => 'required|string|max:255',
        'total' => 'required|integer',
        'male' => 'required|integer',
        'female' => 'required|integer',
    ]);

    $village = Village::firstOrFail();

    $census = Census::create([
        'village_id' => $village->id,
        'category' => $request->category,
        'total' => $request->total,
        'male' => $request->male,
        'female' => $request->female,
    ]);

    return response()->json([
        'message' => 'Census added successfully',
        'data' => $census,
    ]);
}
```

## Middleware Comparison

### Admin Protection

#### Node.js (Express)
```javascript
// No middleware - just inline checks or environment variables
if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Allow access
}
```

#### Laravel (PHP)
```php
// AdminMiddleware.php
public function handle(Request $request, Closure $next): Response
{
    if (!$request->user() || $request->user()->role !== 'admin') {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    return $next($request);
}

// In routes/api.php
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/village/update', [VillageController::class, 'update']);
    // ... other admin routes
});
```

## Model Relationships

### Node.js (No ORM)
```javascript
// Manual joins in queries
const result = await pool.request()
    .query(`
        SELECT * FROM Village;
        SELECT * FROM VillageImages WHERE village_id = (SELECT TOP 1 id FROM Village);
        SELECT * FROM Achievements WHERE village_id = (SELECT TOP 1 id FROM Village);
    `);
```

### Laravel (Eloquent ORM)
```php
// Village Model
class Village extends Model
{
    public function images()
    {
        return $this->hasMany(VillageImage::class);
    }

    public function achievements()
    {
        return $this->hasMany(Achievement::class);
    }

    public function specialPersonalities()
    {
        return $this->hasMany(SpecialPersonality::class);
    }
}

// Usage with eager loading
$village = Village::with(['images', 'achievements', 'specialPersonalities'])->first();
```

## Error Handling

### Node.js (Express)
```javascript
app.get('/village', async (req, res) => {
    try {
        // ... code
    } catch (err) {
        console.error('SQL Error:', err);
        res.json(villageData);  // Fallback data
    }
});
```

### Laravel (PHP)
```php
public function show()
{
    try {
        $village = Village::with(['images', 'achievements'])->firstOrFail();
        return response()->json($village);
    } catch (ModelNotFoundException $e) {
        return response()->json($this->getFallbackData());
    } catch (\Exception $e) {
        Log::error('Village fetch error: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to fetch village data'], 500);
    }
}
```

## Configuration

### Node.js (.env)
```env
DB_USER=sa
DB_PASSWORD=yourpassword
DB_SERVER=localhost
DB_NAME=PanchayatDB
DB_PORT=1433
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
PORT=5000
```

### Laravel (.env)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=panchayat_db
DB_USERNAME=root
DB_PASSWORD=yourpassword
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
APP_URL=http://localhost:8000
```

## Key Differences Summary

| Feature | Node.js | Laravel |
|---------|---------|---------|
| **Language** | JavaScript | PHP |
| **Framework** | Express 5.2.1 | Laravel 11 |
| **Database** | MSSQL | MySQL |
| **ORM** | None (raw SQL) | Eloquent ORM |
| **Auth** | Dummy tokens | Laravel Sanctum |
| **Passwords** | Plain text | Bcrypt hashed |
| **Validation** | Manual | Built-in validator |
| **File Upload** | Multer | Laravel Storage |
| **Middleware** | Custom/inline | Built-in + custom |
| **Error Handling** | Try-catch | Try-catch + exceptions |
| **Code Structure** | Single file (933 lines) | Multiple files (~3000 lines) |
| **Testing** | Manual | PHPUnit built-in |
| **Documentation** | Comments | PHPDoc + comments |
| **Standards** | None | PSR-12 |

## Benefits of Laravel

1. **Security**: Built-in CSRF, XSS, SQL injection protection
2. **Code Quality**: PSR-12 standards, MVC architecture
3. **Maintainability**: Clear separation of concerns
4. **Scalability**: Better organized, easier to extend
5. **Testing**: Built-in testing framework
6. **Community**: Large ecosystem, extensive documentation
7. **Performance**: Query optimization, caching built-in
8. **Developer Experience**: Artisan CLI, migrations, seeders

## Migration Effort

- **Low Effort**: API endpoints remain the same
- **Medium Effort**: Database conversion (MSSQL → MySQL)
- **High Effort**: Rewriting business logic in PHP
- **No Effort**: Frontend (React) - only .env change

## Conclusion

The migration from Node.js to Laravel provides:
- ✅ Better security (hashed passwords, Sanctum tokens)
- ✅ Cleaner code (Eloquent ORM vs raw SQL)
- ✅ Better structure (MVC vs single file)
- ✅ Built-in features (validation, auth, file storage)
- ✅ Same API endpoints (frontend compatibility)
- ✅ Same database schema (data preservation)
