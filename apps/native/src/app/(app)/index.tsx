import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Card, CardHeader } from '@repo/ui/card';
import { Skeleton } from '@repo/ui/skeleton';
import { Text } from '@repo/ui/text';

import { useTRPC } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

function MyPosts() {
  const trpc = useTRPC();
  // Same router as apps/web, fully typed end to end. RLS scopes the rows.
  const { data, isPending, error } = useQuery(trpc.posts.mine.queryOptions());

  if (isPending) {
    return (
      <View className="gap-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </View>
    );
  }
  if (error) {
    return (
      <Text variant="small" className="text-danger" role="alert">
        {error.message}
      </Text>
    );
  }
  if (data.length === 0) {
    return <Text variant="muted">No posts yet.</Text>;
  }

  return (
    <View className="gap-2">
      {data.map((post) => (
        <View
          key={post.id}
          className="flex-row items-center gap-3 rounded-md bg-surface-selected p-3"
        >
          <Text className="flex-1">{post.title}</Text>
          <Badge variant={post.published ? 'default' : 'secondary'}>
            <Text>{post.published ? 'Published' : 'Draft'}</Text>
          </Badge>
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const { session } = useAuth();

  return (
    /*
      `p-safe` on the View, not `<SafeAreaView className="flex-1">` — SafeAreaView
      drops className on native (see the long note in app/sign-in.tsx). Here the
      collapse ran the other way: an auto-height SafeAreaView takes its flex basis
      from the ScrollView's full content height and never shrinks back, so the
      scroll frame ended up taller than the screen with contentSize == frame, and
      nothing past the first screenful was reachable.

      Not folded into contentContainerClassName: `pb-safe` would collide with the
      `pb-24` already there, and react-native-css resolves collisions by
      stylesheet order rather than string position, so the winner would be luck.
    */
    <View className="flex-1 bg-bg p-safe">
      <ScrollView contentContainerClassName="gap-6 p-6 pb-24">
        <View className="gap-2">
          <Text variant="h1">Welcome</Text>
          <Text variant="muted">Signed in as {session?.user.email}</Text>
        </View>

        <Card>
          <CardHeader>
            <Text variant="h3">Your posts</Text>
            <Text variant="muted">
              Fetched from the same tRPC router that apps/web uses.
            </Text>
          </CardHeader>
          <MyPosts />
        </Card>

        {/* `asChild` lets expo-router own the press behaviour. */}
        <Link href="/ui-kit" asChild>
          <Button variant="outline">
            <Text>Component gallery</Text>
          </Button>
        </Link>

        <Button
          variant="secondary"
          onPress={() => {
            void supabase.auth.signOut();
          }}
        >
          <Text>Sign out</Text>
        </Button>
      </ScrollView>
    </View>
  );
}
