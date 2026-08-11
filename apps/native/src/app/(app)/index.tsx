import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@repo/ui/button';
import { ThemedText } from '@repo/ui/themed-text';
import { ThemedView } from '@repo/ui/themed-view';

import { useTRPC } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

function MyPosts() {
  const trpc = useTRPC();
  // Same router as apps/web, fully typed end to end. RLS scopes the rows.
  const { data, isPending, error } = useQuery(trpc.posts.mine.queryOptions());

  if (isPending) return <ActivityIndicator />;
  if (error) {
    return (
      <ThemedText type="small" themeColor="danger">
        {error.message}
      </ThemedText>
    );
  }
  if (data.length === 0) {
    return (
      <ThemedText type="small" themeColor="fgMuted">
        No posts yet.
      </ThemedText>
    );
  }

  return (
    <View className="gap-2">
      {data.map((post) => (
        <ThemedView
          key={post.id}
          type="backgroundSelected"
          className="gap-1 rounded-md p-3"
        >
          <ThemedText>{post.title}</ThemedText>
          <ThemedText type="small" themeColor="fgMuted">
            {post.published ? 'Published' : 'Draft'}
          </ThemedText>
        </ThemedView>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const { session } = useAuth();

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="gap-6 p-6 pb-24">
          <View className="gap-2">
            <ThemedText type="title">Welcome</ThemedText>
            <ThemedText type="small" themeColor="fgMuted">
              Signed in as {session?.user.email}
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" className="gap-3 rounded-card p-4">
            <ThemedText type="subtitle">Your posts</ThemedText>
            <ThemedText type="small" themeColor="fgMuted">
              Fetched from the same tRPC router that apps/web uses.
            </ThemedText>
            <MyPosts />
          </ThemedView>

          <Button
            title="Sign out"
            variant="secondary"
            onPress={() => {
              void supabase.auth.signOut();
            }}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
