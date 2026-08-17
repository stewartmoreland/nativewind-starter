import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@repo/ui/badge';
import { Button, type ButtonProps } from '@repo/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@repo/ui/card';
import { Field } from '@repo/ui/field';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Separator } from '@repo/ui/separator';
import { Skeleton } from '@repo/ui/skeleton';
import { Text } from '@repo/ui/text';

const BUTTON_VARIANTS = [
  'default',
  'secondary',
  'destructive',
  'outline',
  'ghost',
  'link',
] as const satisfies readonly NonNullable<ButtonProps['variant']>[];

const BUTTON_SIZES = ['sm', 'default', 'lg', 'icon'] as const satisfies readonly NonNullable<
  ButtonProps['size']
>[];

const TEXT_VARIANTS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'large',
  'lead',
  'default',
  'small',
  'muted',
  'code',
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text variant="h4">{title}</Text>
      <Separator />
      {children}
    </View>
  );
}

export default function UiKitScreen() {
  const [value, setValue] = useState('');

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView className="flex-1" edges={['bottom']}>
        <ScrollView contentContainerClassName="gap-8 p-6 pb-24">
          <Section title="Text">
            {TEXT_VARIANTS.map((variant) => (
              <Text key={variant} variant={variant}>
                {variant}
              </Text>
            ))}
          </Section>

          <Section title="Button — variants">
            {BUTTON_VARIANTS.map((variant) => (
              <Button key={variant} variant={variant}>
                <Text>{variant}</Text>
              </Button>
            ))}
          </Section>

          <Section title="Button — sizes">
            {BUTTON_SIZES.map((size) => (
              <Button key={size} size={size}>
                <Text>{size === 'icon' ? '★' : size}</Text>
              </Button>
            ))}
          </Section>

          <Section title="Button — states">
            <Button disabled>
              <Text>disabled</Text>
            </Button>
            <Button loading>
              <Text>loading</Text>
            </Button>
            <Button variant="destructive" loading>
              <Text>loading</Text>
            </Button>
            <Button>
              <Badge variant="secondary">
                <Text>1</Text>
              </Badge>
              <Text>arbitrary children</Text>
            </Button>
            {/*
              asChild hands the button's props to the child instead of a
              Pressable. `loading` is deliberately inert here: Slot clones its
              single child, so a spinner would replace the child outright.
            */}
            <Button asChild variant="outline" loading>
              <Pressable>
                <Text>asChild — child kept, spinner suppressed</Text>
              </Pressable>
            </Button>
          </Section>

          {/*
            The override test. If `cn()` is doing its job these differ from the
            defaults above; if class merging regresses, they will not, because
            react-native-css resolves conflicts by stylesheet order rather than
            by position in the className string.
          */}
          <Section title="className overrides">
            <Button className="h-8 rounded-full bg-danger">
              <Text className="text-xs">h-8 rounded-full bg-danger</Text>
            </Button>
            <Text variant="h1" className="text-sm text-brand">
              h1 forced to text-sm text-brand
            </Text>
            <Badge className="bg-surface">
              <Text className="text-fg">badge forced to bg-surface</Text>
            </Badge>
          </Section>

          <Section title="Badge">
            <View className="flex-row flex-wrap gap-2">
              <Badge>
                <Text>default</Text>
              </Badge>
              <Badge variant="secondary">
                <Text>secondary</Text>
              </Badge>
              <Badge variant="destructive">
                <Text>destructive</Text>
              </Badge>
              <Badge variant="outline">
                <Text>outline</Text>
              </Badge>
            </View>
          </Section>

          <Section title="Field / Input / Label">
            <Field
              label="Email"
              placeholder="you@example.com"
              value={value}
              onChangeText={setValue}
              description="Placeholder colour comes from ::placeholder, not a literal."
            />
            <Field
              label="Password"
              placeholder="Password"
              secureTextEntry
              error="That password is too short."
            />
            <View className="gap-2">
              <Label>Bare Label + Input</Label>
              <Input placeholder="No wrapper" />
            </View>
            <View className="gap-2">
              <Label>Read-only</Label>
              <Input placeholder="Not editable" editable={false} />
            </View>
          </Section>

          <Section title="Card">
            <Card>
              <CardHeader>
                <Text variant="h4">Card title</Text>
                <Text variant="muted">Supporting copy.</Text>
              </CardHeader>
              <CardContent>
                <Text>Body content.</Text>
              </CardContent>
              <CardFooter>
                <Button size="sm">
                  <Text>Confirm</Text>
                </Button>
                <Button size="sm" variant="ghost">
                  <Text>Cancel</Text>
                </Button>
              </CardFooter>
            </Card>
          </Section>

          <Section title="Skeleton">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </Section>

          <Section title="Separator">
            <View className="flex-row items-center gap-3">
              <Text variant="small">left</Text>
              <Separator orientation="vertical" className="h-5" />
              <Text variant="small">right</Text>
            </View>
          </Section>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
