<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index()
    {
        $pages = Page::select('id', 'title', 'slug', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($pages);
    }

    public function show($slug)
    {
        $page = Page::where('slug', $slug)->firstOrFail();

        return response()->json($page);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages',
            'content_json' => 'nullable|array',
            'status' => 'nullable|string|in:draft,published',
        ]);

        $page = Page::create([
            'title' => $request->title,
            'slug' => $request->slug,
            'content_json' => $request->content_json ?? [],
            'status' => $request->status ?? 'draft',
        ]);

        return response()->json($page);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug,' . $id,
            'content_json' => 'nullable|array',
            'status' => 'nullable|string|in:draft,published',
        ]);

        $page = Page::findOrFail($id);
        $page->update([
            'title' => $request->title,
            'slug' => $request->slug,
            'content_json' => $request->content_json ?? [],
            'status' => $request->status ?? 'draft',
        ]);

        return response()->json(['message' => 'Page updated']);
    }

    public function destroy($id)
    {
        $page = Page::findOrFail($id);
        $page->delete();

        return response()->json(['message' => 'Page deleted']);
    }
}
