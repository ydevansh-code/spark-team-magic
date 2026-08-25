import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vibwnklqnksiwveswssq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpYndua2xxbmtzaXd2ZXN3c3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MzczNTQsImV4cCI6MjEwMzIxMzM1NH0.gBOME7GR4UuErbUKkxMC1DZZjrLjXcvhLH-xu9PxhIc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const users = [
    { email: 'frontend_demo@test.com', name: 'Alex Frontend', bio: 'Passionate about React and UI animations.', avail: 'full-time', skills: ['React', 'Tailwind'], want: ['UI/UX'] },
    { email: 'designer_demo@test.com', name: 'Sam Designer', bio: 'Figma wizard, love making things beautiful.', avail: 'part-time', skills: ['Figma', 'UI/UX'], want: ['React'] },
    { email: 'backend_demo@test.com', name: 'Jordan Backend', bio: 'Node.js and Postgres enthusiast.', avail: 'full-time', skills: ['Node.js', 'Postgres'], want: ['GraphQL'] },
    { email: 'marketing_demo@test.com', name: 'Taylor Marketing', bio: 'Growth hacker and community builder.', avail: 'part-time', skills: ['SEO', 'Social Media', 'Copywriting'], want: [] },
    { email: 'fullstack_demo@test.com', name: 'Casey Fullstack', bio: 'I build everything from end to end.', avail: 'full-time', skills: ['TypeScript', 'Next.js', 'Supabase'], want: [] },
  ];

  for (const u of users) {
    const { data, error } = await supabase.auth.signUp({ email: u.email, password: 'password123' });
    if (error) {
      console.error('Error signing up', u.email, error);
      continue;
    }
    console.log('Signed up', u.email, data.session ? 'Has session' : 'NO session (needs confirm?)');
    
    if (data.user && data.session) {
       const { error: pe } = await supabase.from('profiles').update({ display_name: u.name, bio: u.bio, availability: u.avail }).eq('id', data.user.id);
       if (pe) console.error('Profile err', pe);
       else console.log('Profile updated!');
       
       const skills = u.skills.map(s => ({ profile_id: data.user.id, skill_name: s, category: 'known' }));
       const wants = u.want.map(s => ({ profile_id: data.user.id, skill_name: s, category: 'wants_to_learn' }));
       if (skills.length > 0 || wants.length > 0) {
         const { error: se } = await supabase.from('skills').insert([...skills, ...wants]);
         if (se) console.error('Skills err', se);
         else console.log('Skills inserted!');
       }
    }
    await supabase.auth.signOut();
  }
}
run();
