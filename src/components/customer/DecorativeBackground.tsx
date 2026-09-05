import {
  BellPepperDoodle,
  ChiliDoodle,
  CitrusDoodle,
  FishDoodle,
  GarlicDoodle,
  TomatoDoodle,
} from "./doodles";

/**
 * Scattered hand-drawn line-art around the page edges, echoing the border
 * illustrations on the business's own flyer. Fixed + behind everything +
 * inert, so it reads as texture rather than competing with real content.
 * Some doodles are hidden below `sm` so small screens stay uncluttered.
 */
export function DecorativeBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-brand/10">
      <TomatoDoodle className="absolute -top-4 -left-6 h-24 w-24 -rotate-12" />
      <FishDoodle className="absolute top-6 -right-8 h-28 w-28 rotate-6 sm:top-10" />
      <CitrusDoodle className="absolute top-1/3 -left-10 hidden h-24 w-24 sm:block" />
      <BellPepperDoodle className="absolute bottom-24 -right-6 h-24 w-24 rotate-12" />
      <GarlicDoodle className="absolute -bottom-6 -left-8 h-28 w-28 -rotate-6" />
      <ChiliDoodle className="absolute bottom-1/3 -right-10 hidden h-20 w-20 rotate-45 sm:block" />
    </div>
  );
}
