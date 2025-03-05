<?php

namespace App\Http\Controllers;

use App\Models\CoachProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class CoachExploreController extends Controller
{
    public function index(Request $request)
    {
        $coaches = CoachProfile::with('user')
            ->where('is_available', true)
            ->when(auth()->check(), function($query) {
                return $query->where('user_id', '!=', auth()->id());
            })
            ->when($request->has('expertise'), function($query) use ($request) {
                return $query->where('expertise', 'like', '%' . $request->expertise . '%');
            })
            ->when($request->has('industry'), function($query) use ($request) {
                return $query->where('industry', 'like', '%' . $request->industry . '%');
            })
            ->paginate(12);
            
        return view('coaches.explore', compact('coaches'));
    }
    
    public function show($id)
    {
        $coach = CoachProfile::with(['user', 'skills', 'reviews'])->findOrFail($id);
        return view('coaches.show', compact('coach'));
    }
    
    public function aiMatch(Request $request)
    {
        $validated = $request->validate([
            'prompt' => 'required|string|max:1000',
        ]);
        
        try {
            $allCoaches = CoachProfile::with('user')
                ->where('is_available', true)
                ->when(auth()->check(), function($query) {
                    return $query->where('user_id', '!=', auth()->id());
                })
                ->get()
                ->toArray();
            
            if (empty($allCoaches)) {
                return response()->json([
                    'message' => 'No coaches available for matching',
                    'coaches' => []
                ]);
            }
            
            $coachesData = [];
            foreach ($allCoaches as $coach) {
                $coachesData[] = [
                    'id' => $coach['id'],
                    'name' => $coach['user']['name'],
                    'expertise' => $coach['expertise'],
                    'industry' => $coach['industry'],
                    'bio' => $coach['bio'],
                    'hourly_rate' => $coach['hourly_rate'],
                ];
            }
            
            $openAiResponse = $this->callOpenAI($validated['prompt'], $coachesData);
            $matchedCoaches = $this->processOpenAiResponse($openAiResponse, $allCoaches);
            
            return response()->json([
                'message' => 'AI matching completed successfully',
                'coaches' => $matchedCoaches
            ]);
            
        } catch (\Exception $e) {
            Log::error('AI Coach Matching Error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Error processing your request',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    private function callOpenAI($prompt, $coachesData)
    {
        $systemPrompt = "You are an expert coach matching assistant. Your task is to analyze the user's coaching needs and preferences, then match them with the most suitable coaches from our database. For each coach, assign a match score from 0.0 to 1.0 (where 1.0 is a perfect match). Return the top 3-5 coaches with the highest match scores, ordered by best match first.";
        $userPrompt = "User coaching needs: " . $prompt . "\n\nAvailable coaches: " . json_encode($coachesData, JSON_PRETTY_PRINT);
        
        $response = OpenAI::chat()->create([
            'model' => 'gpt-4-turbo',
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userPrompt]
            ],
            'temperature' => 0.3,
            'max_tokens' => 2000,
            'response_format' => ['type' => 'json_object']
        ]);
        
        return [
            'choices' => [
                [
                    'message' => [
                        'content' => $response->choices[0]->message->content
                    ]
                ]
            ]
        ];
    }
    
    private function processOpenAiResponse($openAiResponse, $allCoaches)
    {
        $content = $openAiResponse['choices'][0]['message']['content'] ?? null;
        
        if (!$content) {
            throw new \Exception('Invalid response from OpenAI');
        }
        
        $parsedContent = json_decode($content, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Failed to parse OpenAI response as JSON');
        }
        
        $recommendedCoaches = $parsedContent['recommended_coaches'] ?? [];
        
        if (empty($recommendedCoaches)) {
            Log::warning('No recommended coaches in OpenAI response', ['response' => $parsedContent]);
            return [];
        }
        
        $matchedCoaches = [];
        $coachMap = collect($allCoaches)->keyBy('id');
        
        foreach ($recommendedCoaches as $recommendation) {
            $coachId = $recommendation['id'] ?? null;
            $matchScore = $recommendation['match_score'] ?? 0;
            
            if ($coachId && isset($coachMap[$coachId])) {
                $coach = $coachMap[$coachId];
                $coach['match_score'] = $matchScore;
                $matchedCoaches[] = $coach;
            }
        }
        
        usort($matchedCoaches, function($a, $b) {
            return $b['match_score'] <=> $a['match_score'];
        });
        
        return $matchedCoaches;
    }
} 