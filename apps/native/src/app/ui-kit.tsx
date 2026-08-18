import { useState } from 'react';
import Bell from 'lucide-react-native/icons/bell';
import Bold from 'lucide-react-native/icons/bold';
import Italic from 'lucide-react-native/icons/italic';
import Star from 'lucide-react-native/icons/star';
import TriangleAlert from 'lucide-react-native/icons/triangle-alert';
import Underline from 'lucide-react-native/icons/underline';
import { Pressable, ScrollView, View } from 'react-native';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/accordion';
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertTitle,
} from '@repo/ui/alert';
import { Badge } from '@repo/ui/badge';
import { Button, type ButtonProps } from '@repo/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@repo/ui/card';
import { Checkbox } from '@repo/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/ui/collapsible';
import { Field } from '@repo/ui/field';
import { Icon } from '@repo/ui/icon';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Progress } from '@repo/ui/progress';
import { RadioGroup, RadioGroupItem } from '@repo/ui/radio-group';
import { Separator } from '@repo/ui/separator';
import { Skeleton } from '@repo/ui/skeleton';
import { Switch } from '@repo/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Text } from '@repo/ui/text';
import { Textarea } from '@repo/ui/textarea';
import { Toggle } from '@repo/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@repo/ui/toggle-group';

const BUTTON_VARIANTS = [
  'default',
  'secondary',
  'destructive',
  'outline',
  'ghost',
  'link',
] as const satisfies readonly NonNullable<ButtonProps['variant']>[];

const BUTTON_SIZES = [
  'sm',
  'default',
  'lg',
  'icon',
] as const satisfies readonly NonNullable<ButtonProps['size']>[];

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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
  const [bio, setBio] = useState('');
  const [checked, setChecked] = useState(true);
  const [indeterminateCheck, setIndeterminateCheck] = useState(false);
  const [radio, setRadio] = useState('comfortable');
  const [airplane, setAirplane] = useState(false);
  const [wifi, setWifi] = useState(true);
  const [bold, setBold] = useState(false);
  const [align, setAlign] = useState<string | undefined>('bold');
  const [marks, setMarks] = useState<string[]>(['bold']);
  const [tab, setTab] = useState('account');

  return (
    /*
      `pb-safe` on the View, not `<SafeAreaView className="flex-1" edges={['bottom']}>`
      — SafeAreaView drops className on native (see the long note in
      app/sign-in.tsx). The failure here was not a visual one: an auto-height
      SafeAreaView takes its flex basis from the ScrollView's full content height
      and never shrinks back, so the scroll frame ended up taller than the screen
      with contentSize == frame and this gallery simply would not scroll.

      Bottom only, matching the old `edges` — this route is presented as a modal
      and its header owns the top. Kept off contentContainerClassName because
      `pb-safe` would collide with the `pb-24` already there, and react-native-css
      resolves collisions by stylesheet order rather than string position.
    */
    <View className="flex-1 bg-bg pb-safe">
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
          <Progress
            value={60}
            className="h-6 rounded-none bg-danger"
            indicatorClassName="rounded-none bg-fg"
          />
          <Alert className="rounded-none border-brand bg-brand">
            <AlertContent>
              <AlertTitle className="text-brand-fg">
                alert forced to bg-brand
              </AlertTitle>
            </AlertContent>
          </Alert>
          {/*
            A pressed Toggle normally lands on bg-surface-selected. This one
            is forced to bg-danger, which only wins because cn() drops the
            losing background rather than relying on string order.
          */}
          <Toggle pressed className="bg-danger" onPressedChange={() => {}}>
            <Text className="text-danger-fg">pressed toggle forced red</Text>
          </Toggle>
          <Checkbox
            checked
            onCheckedChange={() => {}}
            className="size-8 rounded-full bg-danger border-danger"
          />
          <Icon as={Star} className="size-12 text-danger" />
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

        {/*
          Icon proves two things at once. Colour is never named at any call
          site below: each Icon takes it from the container's
          TextClassContext, the same way Text does. And the size utilities
          must actually change the glyph — if every icon renders at 24px, the
          width/height -> size mapping in icon.tsx did not take.
        */}
        <Section title="Icon — colour follows the container">
          <Button variant="ghost">
            <Icon as={Star} />
            <Text>ghost button</Text>
          </Button>
          <Button>
            <Icon as={Star} />
            <Text>default button</Text>
          </Button>
          <Button variant="destructive">
            <Icon as={Star} />
            <Text>destructive button</Text>
          </Button>
          <View className="flex-row flex-wrap items-center gap-2">
            <Badge variant="destructive">
              <Icon as={Bell} className="size-3" />
              <Text>badge</Text>
            </Badge>
            <Badge variant="outline">
              <Icon as={Bell} className="size-3" />
              <Text>outline badge</Text>
            </Badge>
          </View>
        </Section>

        <Section title="Icon — sizes">
          <View className="flex-row items-end gap-3">
            <Icon as={Star} className="size-4" />
            <Icon as={Star} className="size-6" />
            <Icon as={Star} className="h-8 w-8" />
            <Icon as={Star} className="size-10 text-brand" />
          </View>
          <Text variant="muted">
            size-4, size-6, h-8 w-8, size-10 text-brand
          </Text>
        </Section>

        <Section title="Checkbox">
          <View className="flex-row items-center gap-3">
            <Checkbox checked={checked} onCheckedChange={setChecked} />
            <Text>{checked ? 'checked' : 'unchecked'}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Checkbox
              checked={indeterminateCheck}
              onCheckedChange={setIndeterminateCheck}
            />
            <Text>toggle me</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Checkbox checked disabled onCheckedChange={() => {}} />
            <Text variant="muted">disabled, checked</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Checkbox checked={false} disabled onCheckedChange={() => {}} />
            <Text variant="muted">disabled, unchecked</Text>
          </View>
        </Section>

        <Section title="Radio group">
          <RadioGroup value={radio} onValueChange={setRadio}>
            {['default', 'comfortable', 'compact'].map((option) => (
              <View key={option} className="flex-row items-center gap-3">
                <RadioGroupItem value={option} />
                <Text>{option}</Text>
              </View>
            ))}
            <View className="flex-row items-center gap-3">
              <RadioGroupItem value="disabled" disabled />
              <Text variant="muted">disabled</Text>
            </View>
          </RadioGroup>
        </Section>

        <Section title="Switch">
          <View className="flex-row items-center justify-between">
            <Text>Airplane mode</Text>
            <Switch checked={airplane} onCheckedChange={setAirplane} />
          </View>
          <View className="flex-row items-center justify-between">
            <Text>Wi-Fi</Text>
            <Switch checked={wifi} onCheckedChange={setWifi} />
          </View>
          <View className="flex-row items-center justify-between">
            <Text variant="muted">Disabled, on</Text>
            <Switch checked disabled onCheckedChange={() => {}} />
          </View>
          <View className="flex-row items-center justify-between">
            <Text variant="muted">Disabled, off</Text>
            <Switch checked={false} disabled onCheckedChange={() => {}} />
          </View>
        </Section>

        {/*
          Toggle reuses buttonVariants rather than a parallel table, so a
          Toggle and a Button of the same size are the same height, radius
          and gap. The icon recolours from TextClassContext when pressed.
        */}
        <Section title="Toggle">
          <View className="flex-row flex-wrap items-center gap-2">
            <Toggle size="icon" pressed={bold} onPressedChange={setBold}>
              <Icon as={Bold} />
            </Toggle>
            <Toggle
              size="icon"
              variant="outline"
              pressed={bold}
              onPressedChange={setBold}
            >
              <Icon as={Italic} />
            </Toggle>
            <Toggle pressed={bold} onPressedChange={setBold}>
              <Text>with label</Text>
            </Toggle>
            <Toggle pressed disabled onPressedChange={() => {}}>
              <Text>disabled</Text>
            </Toggle>
          </View>
          <Text variant="muted">
            {bold ? 'pressed' : 'not pressed'} — all four share one state
          </Text>
        </Section>

        <Section title="Toggle group — single">
          <ToggleGroup type="single" value={align} onValueChange={setAlign}>
            <ToggleGroupItem value="bold" size="icon">
              <Icon as={Bold} />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" size="icon">
              <Icon as={Italic} />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" size="icon">
              <Icon as={Underline} />
            </ToggleGroupItem>
          </ToggleGroup>
          <Text variant="muted">value: {align ?? 'none'}</Text>
        </Section>

        <Section title="Toggle group — multiple">
          <ToggleGroup type="multiple" value={marks} onValueChange={setMarks}>
            <ToggleGroupItem value="bold" variant="outline" size="icon">
              <Icon as={Bold} />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" variant="outline" size="icon">
              <Icon as={Italic} />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" variant="outline" size="icon">
              <Icon as={Underline} />
            </ToggleGroupItem>
          </ToggleGroup>
          <Text variant="muted">value: [{marks.join(', ')}]</Text>
        </Section>

        <Section title="Progress">
          <Progress value={0} />
          <Progress value={35} />
          <Progress value={100} />
          <Progress value={35} size="sm" />
          <Progress value={35} size="lg" />
          {/* No value at all: indeterminate, and it pulses. */}
          <Progress value={null} />
        </Section>

        <Section title="Tabs">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="account">
                <Text>Account</Text>
              </TabsTrigger>
              <TabsTrigger value="password">
                <Text>Password</Text>
              </TabsTrigger>
              <TabsTrigger value="disabled" disabled>
                <Text>Disabled</Text>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Text>Account panel.</Text>
            </TabsContent>
            <TabsContent value="password">
              <Text>Password panel.</Text>
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Collapsible">
          <Collapsible>
            <CollapsibleTrigger>
              <Text>Closed by default</Text>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Text variant="muted">
                The chevron rotates through a CSS transition, which
                react-native-css compiles onto reanimated.
              </Text>
            </CollapsibleContent>
          </Collapsible>
          <Collapsible defaultOpen>
            <CollapsibleTrigger>
              <Text>Open by default</Text>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Text variant="muted">Its chevron starts rotated.</Text>
            </CollapsibleContent>
          </Collapsible>
          <Collapsible disabled>
            <CollapsibleTrigger>
              <Text variant="muted">Disabled</Text>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Text variant="muted">Unreachable.</Text>
            </CollapsibleContent>
          </Collapsible>
        </Section>

        <Section title="Accordion — single">
          <Accordion type="single" collapsible defaultValue="first">
            <AccordionItem value="first">
              <AccordionTrigger>
                <Text>Is it accessible?</Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text variant="muted">
                  Yes — the primitive supplies the roles and state.
                </Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="second">
              <AccordionTrigger>
                <Text>Does it animate height?</Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text variant="muted">
                  No. Content unmounts when collapsed, so there is nothing to
                  interpolate. The chevron does animate.
                </Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="third" disabled>
              <AccordionTrigger>
                <Text variant="muted">Disabled item</Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text variant="muted">Unreachable.</Text>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Section>

        <Section title="Accordion — multiple">
          <Accordion type="multiple" defaultValue={['a']}>
            <AccordionItem value="a">
              <AccordionTrigger>
                <Text>First</Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text variant="muted">Both can be open at once.</Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>
                <Text>Second</Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text variant="muted">Open the first and see.</Text>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Section>

        <Section title="Alert">
          <Alert>
            <AlertContent>
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>
                A default alert with no icon.
              </AlertDescription>
            </AlertContent>
          </Alert>
          <Alert>
            <Icon as={Bell} className="mt-0.5 size-5" />
            <AlertContent>
              <AlertTitle>With an icon</AlertTitle>
              <AlertDescription>
                The icon is a child, so it recolours from the alert.
              </AlertDescription>
            </AlertContent>
          </Alert>
          <Alert variant="destructive">
            <Icon as={TriangleAlert} className="mt-0.5 size-5" />
            <AlertContent>
              <AlertTitle>Payment failed</AlertTitle>
              <AlertDescription>
                Your card was declined. Both lines and the glyph go danger.
              </AlertDescription>
            </AlertContent>
          </Alert>
        </Section>

        <Section title="Textarea">
          <Textarea
            placeholder="Tell us about yourself"
            value={bio}
            onChangeText={setBio}
          />
          <Textarea
            placeholder="Taller, via className"
            className="min-h-40"
          />
          <Textarea placeholder="Not editable" editable={false} />
        </Section>

        {/*
          Not a component. react-native-css compiles `aspect-ratio` straight
          to RN's aspectRatio, so @rn-primitives/aspect-ratio buys nothing —
          and a utility can be overridden by cn(), which a `ratio` prop
          cannot. If aspect-video collapses while the other two are right,
          the variable-inlining pass failed to fold --aspect-video.
        */}
        <Section title="Aspect ratio — utilities, no component">
          <View className="aspect-square w-24 rounded-card bg-surface-selected" />
          <View className="aspect-[16/9] w-full rounded-card bg-surface-selected" />
          <View className="aspect-video w-full rounded-card bg-surface-selected" />
        </Section>
      </ScrollView>
    </View>
  );
}
