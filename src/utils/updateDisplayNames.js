import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const displayNameMap = {
  'nidhiiyer22@ifheindia.org': 'Nidhi Iyer',
  'ksahithi22@ifheindia.org': 'Sahithi',
  'ramdassarayu22@ifheindia.org': 'Sarayu',
  'nithinreddy3630@gmail.com': 'Nithin'
};

export const updateAllDisplayNames = async () => {
  try {
    // Get all users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    // Update each user's display name if they have a mapping
    for (const user of users) {
      const displayName = displayNameMap[user.email.toLowerCase()];
      if (displayName) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { user_metadata: { display_name: displayName } }
        );
        if (updateError) {
          console.error(`Failed to update ${user.email}:`, updateError.message);
        } else {
          console.log(`Updated display name for ${user.email} to ${displayName}`);
        }
      }
    }
  } catch (error) {
    console.error('Error updating display names:', error.message);
  }
};

// Alternative method using RPC if admin API is not available
export const updateDisplayNameViaRPC = async () => {
  try {
    const { data, error } = await supabase.rpc('update_user_display_names', {
      name_mappings: JSON.stringify(displayNameMap)
    });
    
    if (error) throw error;
    console.log('Successfully updated display names:', data);
  } catch (error) {
    console.error('Error updating display names:', error.message);
  }
};
