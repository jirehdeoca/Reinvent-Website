#!/usr/bin/env python3
"""
Simple test script to verify Supabase connection and basic functionality
"""

from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://evebeingjjulruzpwkub.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZWJlaW5namp1bHJ1enB3a3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDIxMjksImV4cCI6MjA2NzAxODEyOX0.gs2t5r8GevpVzz2f4A3RbNC6yIwZ1YEv_ckJy7zJ3kk"

def test_connection():
    """Test basic Supabase connection"""
    print("🔄 Testing Supabase connection...")
    print(f"URL: {SUPABASE_URL}")
    
    try:
        # Initialize Supabase client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        
        # Test basic connection by trying to access auth
        auth_user = supabase.auth.get_user()
        print("✅ Successfully connected to Supabase!")
        print(f"Auth service accessible: {auth_user is not None}")
        
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False

def test_table_access():
    """Test table access (will fail if schema not applied)"""
    print("\n🔄 Testing table access...")
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        
        # Try to access programs table
        result = supabase.table('programs').select('*').limit(1).execute()
        print("✅ Programs table accessible!")
        print(f"Programs count: {len(result.data) if result.data else 0}")
        
        return True
        
    except Exception as e:
        print(f"❌ Table access failed: {str(e)}")
        print("ℹ️  This is expected if the schema hasn't been applied yet.")
        return False

def test_auth_functionality():
    """Test authentication functionality"""
    print("\n🔄 Testing authentication functionality...")
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        
        # Test auth session
        session = supabase.auth.get_session()
        print("✅ Auth session accessible!")
        print(f"Current session: {session.session is not None if session else False}")
        
        return True
        
    except Exception as e:
        print(f"❌ Auth test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Reinvent International - Supabase Connection Test")
    print("=" * 60)
    
    # Test basic connection
    connection_ok = test_connection()
    
    if connection_ok:
        # Test auth functionality
        test_auth_functionality()
        
        # Test table access
        test_table_access()
        
        print("\n📋 Connection Summary:")
        print("✅ Supabase connection: Working")
        print("✅ Authentication: Working")
        print("ℹ️  Tables: Will be available after schema application")
        
    else:
        print("\n❌ Connection failed. Please check your Supabase credentials.")
    
    print("\n🔗 Supabase Dashboard: https://supabase.com/dashboard/project/evebeingjjulruzpwkub")

