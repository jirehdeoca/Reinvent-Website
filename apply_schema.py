#!/usr/bin/env python3
"""
Script to apply the Reinvent International database schema to Supabase
"""

import os
import sys
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://evebeingjjulruzpwkub.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZWJlaW5namp1bHJ1enB3a3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDIxMjksImV4cCI6MjA2NzAxODEyOX0.gs2t5r8GevpVzz2f4A3RbNC6yIwZ1YEv_ckJy7zJ3kk"

def read_sql_file(filename):
    """Read SQL file content"""
    try:
        with open(filename, 'r') as file:
            return file.read()
    except FileNotFoundError:
        print(f"Error: {filename} not found")
        return None

def execute_sql_statements(supabase: Client, sql_content: str, description: str):
    """Execute SQL statements using Supabase RPC"""
    print(f"\n🔄 Applying {description}...")
    
    try:
        # Split SQL content into individual statements
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        for i, statement in enumerate(statements):
            if statement:
                print(f"  Executing statement {i+1}/{len(statements)}...")
                
                # Use Supabase RPC to execute SQL
                result = supabase.rpc('exec_sql', {'sql_query': statement}).execute()
                
                if result.data is None and hasattr(result, 'error') and result.error:
                    print(f"  ⚠️  Warning: {result.error}")
                else:
                    print(f"  ✅ Statement {i+1} executed successfully")
        
        print(f"✅ {description} applied successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error applying {description}: {str(e)}")
        return False

def test_connection(supabase: Client):
    """Test Supabase connection"""
    print("🔄 Testing Supabase connection...")
    
    try:
        # Try to fetch from a system table
        result = supabase.rpc('get_schema_version').execute()
        print("✅ Successfully connected to Supabase!")
        return True
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        print("ℹ️  Note: This might be expected if the schema hasn't been applied yet.")
        return False

def apply_schema():
    """Main function to apply the database schema"""
    print("🚀 Reinvent International - Database Schema Application")
    print("=" * 60)
    
    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    # Test connection
    test_connection(supabase)
    
    # Read schema files
    schema_sql = read_sql_file('schema.sql')
    rls_sql = read_sql_file('rls_policies.sql')
    seed_sql = read_sql_file('seed_data.sql')
    
    if not schema_sql:
        print("❌ Could not read schema.sql file")
        return False
    
    success = True
    
    # Apply main schema
    if not execute_sql_statements(supabase, schema_sql, "Main Database Schema"):
        success = False
    
    # Apply RLS policies
    if rls_sql and not execute_sql_statements(supabase, rls_sql, "Row Level Security Policies"):
        success = False
    
    # Apply seed data
    if seed_sql and not execute_sql_statements(supabase, seed_sql, "Seed Data"):
        success = False
    
    if success:
        print("\n🎉 Database schema applied successfully!")
        print("✅ Your Supabase database is now ready for the Reinvent International platform")
    else:
        print("\n⚠️  Some issues occurred during schema application")
        print("ℹ️  Please check the Supabase dashboard for more details")
    
    return success

def verify_tables():
    """Verify that tables were created successfully"""
    print("\n🔄 Verifying table creation...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    expected_tables = [
        'profiles', 'programs', 'modules', 'enrollments', 'user_progress',
        'coaches', 'coaching_sessions', 'discussion_forums', 'forum_posts',
        'prayer_requests', 'testimonials', 'contact_submissions',
        'newsletter_subscriptions', 'events', 'notifications'
    ]
    
    for table in expected_tables:
        try:
            result = supabase.table(table).select('*').limit(1).execute()
            print(f"  ✅ Table '{table}' exists and is accessible")
        except Exception as e:
            print(f"  ❌ Table '{table}' issue: {str(e)}")

if __name__ == "__main__":
    print("Reinvent International Database Setup")
    print("This script will apply the database schema to your Supabase instance.")
    print(f"Target: {SUPABASE_URL}")
    
    # Change to the directory containing the SQL files
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Apply schema
    success = apply_schema()
    
    if success:
        # Verify tables
        verify_tables()
        
        print("\n📋 Next Steps:")
        print("1. Configure Stripe payment processing")
        print("2. Set up email notifications")
        print("3. Test the authentication system")
        print("4. Deploy the frontend application")
    
    sys.exit(0 if success else 1)

