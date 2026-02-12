import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required. Set it in .env.local or as an environment variable.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const memoryFiles = [
  {
    filename: "Gaurav.md",
    description: "Core identity, family, work, calendar, communication style",
    content: `# Gaurav

> Last updated: 2026-02-11
> Auto-updated via Second Mind. Editable directly.

## Identity

- Software engineer and writer based in the US
- Deeply curious about the intersection of technology, design, and human behavior
- Values clarity, craft, and intentionality in both code and prose
- Prefers depth over breadth — would rather master one thing than skim ten

## Family

- Married, two young kids
- Family schedule shapes travel and weekend plans significantly
- Kids' school calendar drives vacation timing (spring break, summer, winter holidays)
- Weekend mornings are family time — work and deep thinking happen early morning or after bedtime

## Work

- Currently building personal tools and writing on Substack
- Past experience in startups and big tech
- Strong opinions about developer experience, product design, and AI tooling
- Interested in building things that compound over time

## Communication Style

- Terse, high-context messages — expects the system to fill in the gaps
- Prefers concise responses over verbose ones
- Likes markdown-formatted output with clear structure
- Appreciates when recommendations come with reasoning, not just answers
`,
  },
  {
    filename: "Taste.md",
    description: "Books, films, music, art, design, aesthetic preferences",
    content: `# Taste

> Last updated: 2026-02-11
> Auto-updated via Second Mind. Editable directly.

## Books

- Gravitates toward literary fiction, essays, and narrative nonfiction
- Favorite authors: Joan Didion, Borges, Calvino, Ted Chiang, Annie Dillard
- Prefers shorter, denser works over sprawling epics
- Loves collections of essays and short stories
- Recently interested in books about craft: writing, design, cooking, gardening

## Films & TV

- Prefers slow cinema and character-driven narratives over blockbusters
- Favorite directors: Wong Kar-wai, Terrence Malick, Celine Sciamma, Hirokazu Koreeda
- Enjoys well-made documentaries about obsessive craftspeople
- Limited TV time — only watches something if multiple trusted people recommend it

## Design & Aesthetics

- Drawn to Japanese design sensibility: wabi-sabi, restraint, materiality
- Prefers warm color palettes over cool/clinical ones
- Typography matters — notices and appreciates good type choices
- Likes interfaces that feel like paper, not software
- Collects examples of beautiful information design
`,
  },
  {
    filename: "Reading.md",
    description: "Books read, reading list, Substacks, reading patterns",
    content: `# Reading

> Last updated: 2026-02-11
> Auto-updated via Second Mind. Editable directly.

## Currently Reading

- "Exercises in Style" by Raymond Queneau — playful, exploring structure
- "A Swim in a Pond in the Rain" by George Saunders — craft of short fiction

## Recently Finished

- "Several Short Sentences About Writing" by Verlyn Klinkenborg — ★★★★★ — changed how I think about prose
- "The Art of Doing Science and Engineering" by Richard Hamming — ★★★★ — dense but rewarding
- "Dept. of Speculation" by Jenny Offill — ★★★★★ — devastating in the best way

## Reading List

- "The Waves" by Virginia Woolf
- "How to Do Nothing" by Jenny Odell
- "Seeing Like a State" by James C. Scott
- "Wind, Sand and Stars" by Antoine de Saint-Exupéry
- "The Timeless Way of Building" by Christopher Alexander

## Substacks & Newsletters

- Craig Mod — walking, photography, bookmaking
- Robin Sloan — technology, fiction, olive oil
- Mandy Brown — working, reading, attention
- Henrik Karlsson — thinking about thinking

## Reading Patterns

- Reads 2-3 books simultaneously (one fiction, one nonfiction, one craft/reference)
- Prefers physical books but uses Kindle for travel
- Reads most consistently in the early morning and before bed
- Tends to abandon books around page 80 if they haven't earned continued attention
`,
  },
  {
    filename: "Travel.md",
    description: "Destinations, hotels, airlines, past trips, bucket list",
    content: `# Travel

> Last updated: 2026-02-11
> Auto-updated via Second Mind. Editable directly.

## Preferences

- Boutique hotels over chains. Character over consistency.
- Walkable neighborhoods matter more than proximity to tourist sites.
- Kids shape logistics: nap schedules, kid-friendly restaurants, not too many museums in a row.
- Direct flights preferred. Will connect for exceptional destinations.
- Packing: minimalist. One carry-on for trips under a week.

## Favorite Destinations

- Lisbon: stayed in Alfama, loved the light and the tiles. Want to return for food.
- Kyoto: best trip ever. Cherry blossom timing was perfect. Philosopher's Path, Arashiyama bamboo grove.
- Copenhagen: Noma-adjacent food scene, design everywhere, bikeable with kids.

## Bucket List

- Basque Country (Spain) — San Sebastian for pintxos and the coastline
- Oaxaca, Mexico — mezcal, mole, markets, Day of the Dead
- Naoshima, Japan — the art island. Combine with a return to Kyoto.
- Puglia, Italy — slow food, whitewashed towns, swimming

## Recent Trips

- 2025-12: Big Island, Hawaii — volcanoes with the kids, snorkeling at Two Step
- 2025-10: Hudson Valley, NY — fall foliage, farm-to-table weekend
- 2025-06: Portugal (Lisbon + Algarve) — first big international trip with both kids
`,
  },
  {
    filename: "Ideas.md",
    description: "Essay seeds, story concepts, creative threads",
    content: `# Ideas

> Last updated: 2026-02-11
> Auto-updated via Second Mind. Editable directly.

## Essay Seeds

- **The Gardener's Paradox**: How tending a garden teaches you that control is an illusion — and how this maps to software engineering and parenting
- **Against Optimization**: Why optimizing everything makes life worse. The case for deliberate inefficiency, scenic routes, and doing things the hard way
- **Second Brain vs. Second Mind**: The difference between storing information and having a system that actually thinks with you. Why most PKM tools fail.

## Story Concepts

- A librarian who discovers that returning overdue books to the wrong shelf creates new stories
- A city where buildings age backward — the oldest structures look newest
- Two strangers who can only communicate through marginalia in the same library book

## Creative Threads

- The relationship between cooking and writing — both are about transformation, timing, and taste
- Collecting examples of "tools that think with you" vs. "tools that think for you"
- Photography as a practice of attention, not documentation

## Half-Formed Thoughts

- There's something interesting about how the best restaurants and the best software share a quality: they anticipate what you want before you articulate it
- The difference between curation and hoarding is intention
- Why do Japanese woodworking and functional programming feel similar?
`,
  },
];

async function seed() {
  console.log("Seeding memory files...");

  for (const file of memoryFiles) {
    const { error } = await supabase
      .from("memory_files")
      .upsert(
        {
          filename: file.filename,
          description: file.description,
          content: file.content,
        },
        { onConflict: "filename" }
      );

    if (error) {
      console.error(`Failed to seed ${file.filename}:`, error.message);
    } else {
      console.log(`  ✓ ${file.filename}`);
    }
  }

  // Verify
  const { data, error } = await supabase
    .from("memory_files")
    .select("filename, description, version")
    .order("filename");

  if (error) {
    console.error("Failed to verify:", error.message);
    process.exit(1);
  }

  console.log(`\nSeeded ${data.length} memory files:`);
  for (const row of data) {
    console.log(`  ${row.filename} (v${row.version}) — ${row.description}`);
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
