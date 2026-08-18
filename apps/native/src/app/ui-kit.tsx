import { useState } from 'react';
import Bell from 'lucide-react-native/icons/bell';
import Bold from 'lucide-react-native/icons/bold';
import Italic from 'lucide-react-native/icons/italic';
import Copy from 'lucide-react-native/icons/copy';
import Star from 'lucide-react-native/icons/star';
import Trash2 from 'lucide-react-native/icons/trash-2';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/alert-dialog';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@repo/ui/context-menu';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu';
import { Field } from '@repo/ui/field';
import { Icon } from '@repo/ui/icon';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/popover';
import { Progress } from '@repo/ui/progress';
import { RadioGroup, RadioGroupItem } from '@repo/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from '@repo/ui/select';
import { Separator } from '@repo/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/sheet';
import { Skeleton } from '@repo/ui/skeleton';
import { Switch } from '@repo/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Text } from '@repo/ui/text';
import { Textarea } from '@repo/ui/textarea';
import { Toast, ToastDescription, ToastTitle, useToast } from '@repo/ui/toast';
import { Toggle } from '@repo/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@repo/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui/tooltip';

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

const LOREM =
  'Overlays are the one part of the kit that can bundle cleanly, typecheck, ' +
  'and still render nothing at all, so every one of them is here in every ' +
  'state it supports. This paragraph exists to give a surface enough text to ' +
  'push against its own bounds.';

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
  const [menuChecked, setMenuChecked] = useState(true);
  const [menuRadio, setMenuRadio] = useState('medium');
  const [fruit, setFruit] = useState<SelectOption>(undefined);
  const { toast, dismiss } = useToast();

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

        {/*
          Everything below is portalled. This route is presented as a MODAL,
          which makes it the hardest test of the FullWindowOverlay wrap in
          @repo/ui/portal: an overlay painting under this screen's navigation bar
          means the host is parented to the navigator rather than the window.

          If a section below renders NOTHING when its trigger is tapped, check
          that <UiPortalHost /> is still the last child of app/_layout.tsx before
          suspecting the component — that failure is completely silent.
        */}
        <Section title="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Text>Open dialog</Text>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete project</DialogTitle>
                <DialogDescription>
                  This removes the project and everything in it.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">
                    <Text>Cancel</Text>
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive">
                    <Text>Delete</Text>
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Text>No close button</Text>
              </Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>Dismiss deliberately</DialogTitle>
                <DialogDescription>
                  The scrim still closes this one — only the corner button is
                  gone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>
                    <Text>Got it</Text>
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/*
            A long body must stay on screen rather than growing past both edges.
            The Overlay's own p-6 is what bounds it.
          */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Text>Long content</Text>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Terms</DialogTitle>
                <DialogDescription>{LOREM}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>
                    <Text>Accept</Text>
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/*
            The override case. Square corners, a red card and a blue scrim mean
            cn() is still dropping the losing class; if this looks like the
            dialogs above, class merging has regressed.
          */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Text>Override — bg-danger card, bg-brand scrim</Text>
              </Button>
            </DialogTrigger>
            <DialogContent
              className="rounded-none bg-danger"
              overlayClassName="bg-brand"
            >
              <DialogHeader>
                <DialogTitle className="text-danger-fg">
                  Forced to bg-danger
                </DialogTitle>
                <DialogDescription className="text-danger-fg">
                  rounded-none, and the scrim is bg-brand rather than bg-overlay.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </Section>

        <Section title="Alert dialog">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="secondary">
                <Text>Open alert dialog</Text>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard draft?</AlertDialogTitle>
                <AlertDialogDescription>
                  Pressing the scrim does NOT close this one — its Overlay is a
                  plain View, so there is no press to handle. That is the whole
                  difference from Dialog.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Text>Keep editing</Text>
                </AlertDialogCancel>
                <AlertDialogAction>
                  <Text>Discard</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Action reuses buttonVariants, so a destructive confirm is a prop. */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="secondary">
                <Text>Destructive action</Text>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account</AlertDialogTitle>
                <AlertDialogDescription>
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Text>Cancel</Text>
                </AlertDialogCancel>
                <AlertDialogAction variant="destructive">
                  <Text>Delete</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Text>Override — border-2 border-danger</Text>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-2 border-danger bg-surface-selected">
              <AlertDialogHeader>
                <AlertDialogTitle>Forced surface</AlertDialogTitle>
                <AlertDialogDescription>
                  bg-surface-selected with a 2px danger border.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Text>Close</Text>
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Section>

        <Section title="Sheet">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">
                <Text>Bottom sheet</Text>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Share</SheetTitle>
                <SheetDescription>
                  The bottom padding is pb-safe-offset-6, so this clears the home
                  indicator. If it looks flush against the bottom edge, the
                  portal host has been mounted outside the SafeAreaProvider.
                </SheetDescription>
              </SheetHeader>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="secondary">
                    <Text>Close</Text>
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">
                <Text>Top sheet</Text>
              </Button>
            </SheetTrigger>
            <SheetContent side="top">
              <SheetHeader>
                <SheetTitle>Top edge</SheetTitle>
                <SheetDescription>pt-safe-offset-6 clears the notch.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">
                <Text>No handle</Text>
              </Button>
            </SheetTrigger>
            <SheetContent showHandle={false}>
              <SheetHeader>
                <SheetTitle>No grabber</SheetTitle>
                <SheetDescription>
                  Nothing is draggable either way — the handle is decoration.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          {/*
            max-h works on the dialog family because its Content carries no
            inline style — unlike the positioned overlays below.
          */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">
                <Text>Tall content, capped at max-h-[70%]</Text>
              </Button>
            </SheetTrigger>
            <SheetContent className="max-h-[70%]">
              <SheetHeader>
                <SheetTitle>Capped</SheetTitle>
                <SheetDescription>{LOREM}</SheetDescription>
                <SheetDescription>{LOREM}</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Text>Override — rounded-none bg-danger</Text>
              </Button>
            </SheetTrigger>
            <SheetContent className="rounded-none bg-danger">
              <SheetHeader>
                <SheetTitle className="text-danger-fg">Forced red</SheetTitle>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </Section>

        <Section title="Popover">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">
                <Text>Open popover</Text>
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Text variant="small">Anchored below, centre-aligned.</Text>
              <PopoverClose asChild>
                <Button size="sm" variant="secondary">
                  <Text>Close</Text>
                </Button>
              </PopoverClose>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">
                <Text>side=&quot;top&quot; align=&quot;end&quot;</Text>
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end">
              <Text variant="small">Above the trigger, right-aligned.</Text>
            </PopoverContent>
          </Popover>

          {/*
            KEEP THIS. It is the visible proof that the positioning hook's inline
            style beats a class: useRelativePosition applies { position, top,
            left, maxWidth } inline, and react-native-css merges the inline prop
            LAST. So min-w-96 visibly widens its popover and max-w-24 does
            nothing at all. If the max-w one ever starts narrowing, the merge
            order changed upstream and popover.tsx's note is stale.
          */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Text>min-w-96 — takes</Text>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-96">
              <Text variant="small">min-w-96 widened this.</Text>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Text>max-w-24 — silently dead</Text>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-24">
              <Text variant="small">max-w-24 did not narrow this.</Text>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Text>Override — bg-brand</Text>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-brand">
              <Text variant="small" className="text-brand-fg">
                Forced to bg-brand.
              </Text>
            </PopoverContent>
          </Popover>
        </Section>

        <Section title="Dropdown menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                <Text>Open menu</Text>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Icon as={Copy} />
                <Text>Duplicate</Text>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Text>Rename</Text>
                <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Text>Disabled</Text>
              </DropdownMenuItem>
              {/*
                Both the glyph and the label turn red from the item's
                TextClassContext — no colour at either call site.
              */}
              <DropdownMenuItem variant="destructive">
                <Icon as={Trash2} />
                <Text>Delete</Text>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={menuChecked}
                onCheckedChange={setMenuChecked}
              >
                <Text>Show hidden</Text>
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Density</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={menuRadio}
                onValueChange={setMenuRadio}
              >
                <DropdownMenuRadioItem value="compact">
                  <Text>Compact</Text>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="medium">
                  <Text>Medium</Text>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="roomy">
                  <Text>Roomy</Text>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              {/* SubContent has no positioning props — it expands inline. */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Text>More</Text>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>
                    <Text>Export</Text>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Text>Archive</Text>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          <Text variant="muted">
            checked: {String(menuChecked)} · density: {menuRadio}
          </Text>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                <Text>align=&quot;end&quot;</Text>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Text>Right-aligned</Text>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Text>Override — bg-danger content</Text>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-none bg-danger">
              <DropdownMenuItem className="bg-danger-fg">
                <Text>Forced item background</Text>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Section title="Context menu">
          <ContextMenu>
            {/*
              No `asChild` here: the primitive's Trigger forwards only
              `onLongPress`, and Card renders a plain View, which has no
              long-press handling — so `asChild` around a Card silently does
              nothing. Without it the Trigger renders its own Pressable.
            */}
            <ContextMenuTrigger>
              <Card>
                <CardHeader>
                  <Text variant="large">Long-press me</Text>
                  <Text variant="muted">
                    Opens at the finger — relativeTo defaults to
                    &quot;longPress&quot;.
                  </Text>
                </CardHeader>
              </Card>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>
                <Icon as={Copy} />
                <Text>Copy</Text>
              </ContextMenuItem>
              <ContextMenuCheckboxItem
                checked={menuChecked}
                onCheckedChange={setMenuChecked}
              >
                <Text>Pinned</Text>
              </ContextMenuCheckboxItem>
              <ContextMenuSeparator />
              <ContextMenuItem variant="destructive">
                <Icon as={Trash2} />
                <Text>Delete</Text>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          <ContextMenu relativeTo="trigger">
            {/*
              No `asChild` here: the primitive's Trigger forwards only
              `onLongPress`, and Card renders a plain View, which has no
              long-press handling — so `asChild` around a Card silently does
              nothing. Without it the Trigger renders its own Pressable.
            */}
            <ContextMenuTrigger>
              <Card>
                <CardHeader>
                  <Text variant="large">relativeTo=&quot;trigger&quot;</Text>
                  <Text variant="muted">
                    Anchors to this card instead of the touch point.
                  </Text>
                </CardHeader>
              </Card>
            </ContextMenuTrigger>
            <ContextMenuContent className="rounded-none border-brand">
              <ContextMenuItem>
                <Text>Override — square, brand border</Text>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </Section>

        <Section title="Select">
          <Select value={fruit} onValueChange={setFruit}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruit</SelectLabel>
                <SelectItem value="apple" label="Apple" />
                <SelectItem value="banana" label="Banana" />
                <SelectItem value="cherry" label="Cherry" />
                <SelectItem value="date" label="Date" />
                <SelectItem value="elderberry" label="Elderberry" disabled />
              </SelectGroup>
            </SelectContent>
          </Select>
          {/* Proves the Option object round-trips rather than a bare string. */}
          <Text variant="muted">
            value: {fruit ? `${fruit.value} / ${fruit.label}` : 'none'}
          </Text>

          {/* 20 items, to exercise the ScrollView's max-h-80 cap. */}
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Long list" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => (
                <SelectItem
                  key={i}
                  value={String(i)}
                  label={`Option ${i + 1}`}
                />
              ))}
            </SelectContent>
          </Select>

          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Disabled" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" label="Unreachable" />
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="h-8 rounded-full bg-brand">
              <SelectValue placeholder="Override" className="text-brand-fg" />
            </SelectTrigger>
            <SelectContent className="bg-danger">
              <SelectItem
                value="x"
                label="Forced content background"
                textClassName="text-danger-fg"
              />
            </SelectContent>
          </Select>
        </Section>

        <Section title="Tooltip">
          {/*
            This first trigger is deliberately the topmost thing in the section.
            Auto-flip does NOT work on native — getSidePosition clamps instead —
            so near the top of the screen a side="top" tooltip is pushed back
            down onto its trigger rather than flipping below it. Scroll this
            section to the top of the viewport to see it.
          */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary">
                <Text>side=&quot;top&quot; (clamps near the top edge)</Text>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <Text>Copied to clipboard</Text>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary">
                <Text>side=&quot;bottom&quot;</Text>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <Text>Below the trigger</Text>
            </TooltipContent>
          </Tooltip>

          <Tooltip autoDismiss={null}>
            <TooltipTrigger asChild>
              <Button variant="secondary">
                <Text>autoDismiss={'{null}'} — sticky</Text>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <Text>Stays until tapped away</Text>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">
                <Text>Override — bg-brand</Text>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-brand">
              <Text className="text-brand-fg">Forced to bg-brand</Text>
            </TooltipContent>
          </Tooltip>
        </Section>

        <Section title="Toast">
          <Button
            variant="secondary"
            onPress={() => toast({ title: 'Saved' })}
          >
            <Text>Default</Text>
          </Button>
          <Button
            variant="secondary"
            onPress={() =>
              toast({
                title: 'Project archived',
                description: 'You can restore it from Settings.',
              })
            }
          >
            <Text>With description</Text>
          </Button>
          <Button
            variant="secondary"
            onPress={() =>
              toast({
                title: 'Upload failed',
                description: 'The connection dropped.',
                variant: 'destructive',
              })
            }
          >
            <Text>Destructive</Text>
          </Button>
          <Button
            variant="secondary"
            onPress={() =>
              toast({
                title: 'Message sent',
                action: { label: 'Undo', onPress: () => {} },
              })
            }
          >
            <Text>With action</Text>
          </Button>
          <Button
            variant="secondary"
            onPress={() => toast({ title: 'Sticky', duration: null })}
          >
            <Text>Sticky (duration: null)</Text>
          </Button>
          {/*
            Six at once with limit=3 proves the queue holds rather than drops,
            and that a queued toast does not start its timer until it is visible.
          */}
          <Button
            variant="secondary"
            onPress={() => {
              for (let i = 1; i <= 6; i++) toast({ title: `Queued ${i}` });
            }}
          >
            <Text>Fire 6 — queues past limit</Text>
          </Button>
          <Button variant="secondary" onPress={() => dismiss()}>
            <Text>Dismiss all</Text>
          </Button>

          {/*
            Rendered inline rather than through the queue, so the class merge is
            visible without racing a timer.
          */}
          <Toast open onOpenChange={() => {}} className="rounded-none bg-brand">
            <View className="flex-1 gap-1">
              <ToastTitle className="text-brand-fg">Override</ToastTitle>
              <ToastDescription className="text-brand-fg">
                rounded-none bg-brand, static.
              </ToastDescription>
            </View>
          </Toast>
        </Section>

        {/*
          The single most valuable case here. A Select and a DropdownMenu opened
          from inside a Dialog prove that nested portals coexist in one registry
          and that the inner overlay positions against the window rather than
          against the dialog card.

          The toast button proves a toast raised WHILE the dialog is open draws
          above its scrim. The reverse does not hold — a toast already on screen
          when the dialog opens is dimmed underneath it, because the portal host
          paints its registry in registration order. See the note in toast.tsx;
          it is a documented limitation, not a regression.
        */}
        <Section title="Overlays — stacking">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Text>Dialog containing overlays</Text>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nested</DialogTitle>
                <DialogDescription>
                  Everything below is portalled out of this card.
                </DialogDescription>
              </DialogHeader>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select inside a dialog" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one" label="One" />
                  <SelectItem value="two" label="Two" />
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">
                    <Text>Menu inside a dialog</Text>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Text>Still on top</Text>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogFooter>
                <Button
                  onPress={() => toast({ title: 'Raised from inside a dialog' })}
                >
                  <Text>Raise a toast</Text>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>
      </ScrollView>
    </View>
  );
}
