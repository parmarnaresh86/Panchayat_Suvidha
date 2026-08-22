<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PageContent;
use Illuminate\Http\Request;

class PageContentController extends Controller
{
    public function show($pageName)
    {
        $pageContent = PageContent::where('page_name', $pageName)->first();

        if (!$pageContent) {
            return response()->json(['error' => 'No saved layout'], 404);
        }

        return response()->json([
            'sections' => $pageContent->content_json ?? [],
        ]);
    }

    public function update(Request $request, $pageName)
    {
        $request->validate([
            'sections' => 'required|array',
        ]);

        PageContent::updateOrCreate(
            ['page_name' => $pageName],
            ['content_json' => $request->sections]
        );

        return response()->json(['message' => 'Layout saved']);
    }
}
