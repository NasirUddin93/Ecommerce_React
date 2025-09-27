<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\User;

class AuthController extends Controller
{
    public function authenticate(Request $request)
    {
        // Step 1: Validate request data
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors'  => $validator->errors(),
            ], 400);
        }

        // Step 2: Attempt login
        if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            $user = User::find(Auth::id());
            if($user->role == 'admin'){
                $token = $user->createToken('token')->plainTextToken;

                return response()->json([
                'status' => 200,
                'token' => $token,
                'id' => $user->id,
                'name' => $user->name,
            ], 200);


            }else{
                return response()->json([
                'status' => 401,
                'message' => 'You are not authorized to access admin panel',
                ], 401);
            }
        }else{
                return response()->json([
                'status' => 401,
                'message' => 'Either Email/Password is incorrect.',
            ], 401);
        }
    }
}
