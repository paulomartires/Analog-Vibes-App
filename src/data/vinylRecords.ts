export interface Track {
  number: number;
  title: string;
  duration: string;
}

// Master Release: Original album information (shared across all pressings)
export interface MasterRelease {
  id: string;
  title: string;
  artist: string;
  genre: string;
  description?: string; // Original album notes/description
  producer?: string;
  recordingDate?: string; // When the album was originally recorded
}

// Vinyl Release: Your specific pressing information
export interface VinylRelease {
  id: string;
  releaseDate: string; // When YOUR pressing was released
  label: string;
  catalogNumber: string;
  coverUrl: string; // Cover of YOUR pressing
  tracks: Track[]; // Tracklist of YOUR pressing
  masterId: string; // Links to the master release
}

// Combined interface for UI compatibility (computed from both sources)
export interface VinylRecord {
  id: string;
  title: string;
  artist: string;
  year: string; // From master release
  label: string; // From your release
  genre: string;
  catalogNumber: string;
  coverUrl: string; // From your release
  tracks: Track[]; // From your release
  description?: string; // From master release
  producer?: string; // From master release
  recordingDate?: string; // From master release
  releaseDate?: string; // From your release (NEW)
  
  // Internal references (not used by UI)
  _masterRelease?: MasterRelease;
  _vinylRelease?: VinylRelease;
}

export const vinylRecords: VinylRecord[] = [
  {
    id: "1",
    title: "The Sidewinder",
    artist: "Lee Morgan",
    year: "1963",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 4157",
    coverUrl: "https://images.unsplash.com/photo-1571974599782-87624638275d?w=400&h=400&fit=crop&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "December 1963",
    description: "Lee Morgan's breakthrough album featuring his infectious title track that became a crossover hit. This iconic Blue Note session showcases the legendary cover design by Reid Miles with bold typography and vibrant colors.",
    tracks: [
      { number: 1, title: "The Sidewinder", duration: "10:35" },
      { number: 2, title: "Totem Pole", duration: "6:58" },
      { number: 3, title: "Gary's Notebook", duration: "7:25" },
      { number: 4, title: "Boy, What a Night", duration: "6:12" },
      { number: 5, title: "Hocus-Pocus", duration: "7:02" }
    ]
  },
  {
    id: "2",
    title: "Song for My Father",
    artist: "Horace Silver",
    year: "1964",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 4185",
    coverUrl: "https://images.unsplash.com/photo-1571974599782-87624638275d?w=400&h=400&fit=crop&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "October 1964",
    description: "Horace Silver's masterpiece featuring his most famous composition with classic Reid Miles cover design. A perfect blend of Latin rhythms and hard bop sensibilities showcasing the iconic Blue Note aesthetic.",
    tracks: [
      { number: 1, title: "Song for My Father", duration: "7:20" },
      { number: 2, title: "The Natives Are Restless Tonight", duration: "6:45" },
      { number: 3, title: "Calcutta Cutie", duration: "5:18" },
      { number: 4, title: "Que Pasa", duration: "6:52" },
      { number: 5, title: "The Kicker", duration: "4:33" }
    ]
  },
  {
    id: "3",
    title: "Speak No Evil",
    artist: "Wayne Shorter",
    year: "1964",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 4194",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "December 1964",
    description: "Wayne Shorter's compositional genius with stunning Francis Wolff photography and Reid Miles' iconic design. Features the classic Blue Note aesthetic with bold geometric elements and high contrast photography.",
    tracks: [
      { number: 1, title: "Witch Hunt", duration: "8:07" },
      { number: 2, title: "Fee-Fi-Fo-Fum", duration: "5:49" },
      { number: 3, title: "Dance Cadaverous", duration: "6:42" },
      { number: 4, title: "Speak No Evil", duration: "8:22" },
      { number: 5, title: "Infant Eyes", duration: "6:55" }
    ]
  },
  {
    id: "4",
    title: "Point of Departure",
    artist: "Andrew Hill",
    year: "1964",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 4167",
    coverUrl: "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=400&h=400&fit=crop&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "March 1964",
    description: "Andrew Hill's avant-garde masterpiece featuring the quintessential Blue Note cover design with Reid Miles' bold typography and dramatic color contrasts. A pioneering work of modern jazz composition.",
    tracks: [
      { number: 1, title: "Refuge", duration: "7:42" },
      { number: 2, title: "New Monastery", duration: "6:23" },
      { number: 3, title: "Flight 19", duration: "8:15" },
      { number: 4, title: "Dance with Death", duration: "9:38" },
      { number: 5, title: "Spectrum", duration: "5:47" }
    ]
  },
  {
    id: "5",
    title: "Out to Lunch!",
    artist: "Eric Dolphy",
    year: "1964",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 4163",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&sat=-100&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "February 1964",
    description: "Eric Dolphy's avant-garde masterpiece featuring iconic Blue Note design with Francis Wolff's striking photography and Reid Miles' revolutionary layout. His final recording as a leader.",
    tracks: [
      { number: 1, title: "Hat and Beard", duration: "4:12" },
      { number: 2, title: "Something Sweet, Something Tender", duration: "8:35" },
      { number: 3, title: "Gazzelloni", duration: "6:48" },
      { number: 4, title: "Out to Lunch", duration: "7:03" },
      { number: 5, title: "Straight Up and Down", duration: "4:27" }
    ]
  },
  {
    id: "6",
    title: "Unity",
    artist: "Larry Young",
    year: "1965",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 4221",
    coverUrl: "https://images.unsplash.com/photo-1571974599782-87624638275d?w=400&h=400&fit=crop&sat=50&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "November 1965",
    description: "Larry Young's groundbreaking organ work showcasing the distinctive Blue Note visual identity with Francis Wolff's dynamic photography and Reid Miles' innovative graphic design approach.",
    tracks: [
      { number: 1, title: "Zoltan", duration: "6:45" },
      { number: 2, title: "Moontrane", duration: "8:22" },
      { number: 3, title: "Beyond All Limits", duration: "7:15" },
      { number: 4, title: "Unity", duration: "9:38" },
      { number: 5, title: "Seventh Trip", duration: "5:42" }
    ]
  },
  {
    id: "7",
    title: "The Cat Walk",
    artist: "Donald Byrd",
    year: "1961",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 4075",
    coverUrl: "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=400&h=400&fit=crop&sat=-50&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "May 1961",
    description: "Donald Byrd's hard bop masterpiece featuring the legendary Blue Note design aesthetic with Reid Miles' bold geometric layouts and vibrant color schemes that defined an era.",
    tracks: [
      { number: 1, title: "Say You're Mine", duration: "6:42" },
      { number: 2, title: "Duke's Mixture", duration: "7:18" },
      { number: 3, title: "Each Time I Think of You", duration: "5:33" },
      { number: 4, title: "The Cat Walk", duration: "8:45" },
      { number: 5, title: "Hello Bright Sunflower", duration: "6:22" }
    ]
  },
  {
    id: "8",
    title: "Go!",
    artist: "Dexter Gordon",
    year: "1962",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 4112",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "August 1962",
    description: "Dexter Gordon's explosive return to America showcased with the iconic Blue Note visual treatment featuring Francis Wolff's dramatic photography and Reid Miles' revolutionary typography.",
    tracks: [
      { number: 1, title: "Cheese Cake", duration: "7:35" },
      { number: 2, title: "For Regulars Only", duration: "8:48" },
      { number: 3, title: "Love for Sale", duration: "9:22" },
      { number: 4, title: "Where Are You?", duration: "6:45" },
      { number: 5, title: "Three O'Clock in the Morning", duration: "5:18" }
    ]
  },
  {
    id: "9",
    title: "Maiden Voyage",
    artist: "Herbie Hancock",
    year: "1965",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 4195",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&hue=240&sat=80&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "March 1965",
    description: "Herbie Hancock's modal jazz masterpiece featuring the classic Blue Note aesthetic with Reid Miles' innovative design philosophy and Francis Wolff's striking portrait photography.",
    tracks: [
      { number: 1, title: "Maiden Voyage", duration: "7:55" },
      { number: 2, title: "The Eye of the Hurricane", duration: "5:55" },
      { number: 3, title: "Little One", duration: "8:52" },
      { number: 4, title: "Survival of the Fittest", duration: "10:12" },
      { number: 5, title: "Dolphin Dance", duration: "9:08" }
    ]
  },
  {
    id: "10",
    title: "Blue Train",
    artist: "John Coltrane",
    year: "1957",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 1577",
    coverUrl: "https://images.unsplash.com/photo-1571974599782-87624638275d?w=400&h=400&fit=crop&hue=180&sat=60&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "September 1957",
    description: "John Coltrane's only recording as leader for Blue Note, featuring the quintessential Blue Note cover design with Reid Miles' bold typography and the iconic Francis Wolff photography that defined the label's visual identity.",
    tracks: [
      { number: 1, title: "Blue Train", duration: "10:43" },
      { number: 2, title: "Moment's Notice", duration: "9:10" },
      { number: 3, title: "Locomotion", duration: "7:13" },
      { number: 4, title: "I'm Old Fashioned", duration: "7:58" },
      { number: 5, title: "Lazy Bird", duration: "7:00" }
    ]
  },
  {
    id: "11",
    title: "Empyrean Isles",
    artist: "Herbie Hancock",
    year: "1964",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 4175",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop&hue=60&sat=70&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "June 1964",
    description: "Herbie Hancock's innovative quartet session showcasing the legendary Blue Note design approach with dramatic high-contrast photography and Reid Miles' revolutionary graphic design that influenced album art for decades.",
    tracks: [
      { number: 1, title: "One Finger Snap", duration: "8:14" },
      { number: 2, title: "Oliloqui Valley", duration: "8:18" },
      { number: 3, title: "Cantaloupe Island", duration: "5:32" },
      { number: 4, title: "The Egg", duration: "13:08" }
    ]
  },
  {
    id: "12",
    title: "Cornbread",
    artist: "Lee Morgan",
    year: "1965",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 4222",
    coverUrl: "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=400&h=400&fit=crop&hue=30&sat=90&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "September 1965",
    description: "Lee Morgan's spirited hard bop session featuring the iconic Blue Note visual treatment with Francis Wolff's dynamic photography and Reid Miles' bold color palette that epitomized the label's aesthetic revolution.",
    tracks: [
      { number: 1, title: "Cornbread", duration: "8:18" },
      { number: 2, title: "Our Man Higgins", duration: "7:45" },
      { number: 3, title: "Most Like Lee", duration: "6:33" },
      { number: 4, title: "Ceora", duration: "5:57" },
      { number: 5, title: "Ill Wind", duration: "7:22" }
    ]
  },
  {
    id: "13",
    title: "Midnight Blue",
    artist: "Kenny Burrell",
    year: "1963",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 4123",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&hue=220&sat=70&brightness=-20&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "January 1963",
    description: "Kenny Burrell's soulful guitar work showcasing the classic Blue Note design philosophy with dramatic lighting and bold color contrasts that defined the label's revolutionary aesthetic approach.",
    tracks: [
      { number: 1, title: "Chitlins con Carne", duration: "9:15" },
      { number: 2, title: "Mule", duration: "6:23" },
      { number: 3, title: "Soul Lament", duration: "8:47" },
      { number: 4, title: "Midnight Blue", duration: "7:12" },
      { number: 5, title: "Wavy Gravy", duration: "5:38" }
    ]
  },
  {
    id: "14",
    title: "A New Perspective",
    artist: "Donald Byrd",
    year: "1963",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 4124",
    coverUrl: "https://images.unsplash.com/photo-1571974599782-87624638275d?w=400&h=400&fit=crop&hue=280&sat=80&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "January 1963",
    description: "Donald Byrd's innovative hard bop session featuring the iconic Blue Note visual treatment with Reid Miles' geometric design principles and Francis Wolff's groundbreaking photography techniques.",
    tracks: [
      { number: 1, title: "Elijah", duration: "7:15" },
      { number: 2, title: "Black Disciple", duration: "8:42" },
      { number: 3, title: "A New Perspective", duration: "6:33" },
      { number: 4, title: "Cristo Redentor", duration: "9:18" },
      { number: 5, title: "The Loner", duration: "5:47" }
    ]
  },
  {
    id: "15",
    title: "Page One",
    artist: "Joe Henderson",
    year: "1963",
    label: "Blue Note",
    genre: "Jazz",
    catalogNumber: "BLP 4140",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop&hue=160&sat=85&auto=format&q=80",
    producer: "Alfred Lion",
    recordingDate: "June 1963",
    description: "Joe Henderson's remarkable Blue Note debut showcasing the label's legendary design aesthetic with bold typography, vibrant colors, and the sophisticated visual approach that revolutionized album cover art.",
    tracks: [
      { number: 1, title: "Blue Bossa", duration: "7:22" },
      { number: 2, title: "La Mesha", duration: "6:45" },
      { number: 3, title: "Homestretch", duration: "5:18" },
      { number: 4, title: "Recorda Me", duration: "8:52" },
      { number: 5, title: "Jinrikisha", duration: "6:33" }
    ]
  },
  // NEW: Miles Davis albums to test "Other Albums from Artist" functionality
  {
    id: "16",
    title: "Kind of Blue",
    artist: "Miles Davis",
    year: "1959",
    label: "Columbia",
    genre: "Jazz",
    catalogNumber: "CL 1355",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&hue=200&sat=100&auto=format&q=80",
    producer: "Teo Macero",
    recordingDate: "March & April 1959",
    description: "Miles Davis' masterpiece and one of the greatest jazz albums ever recorded. This modal jazz landmark features an all-star sextet including John Coltrane, Bill Evans, and Cannonball Adderley, showcasing the iconic Columbia Records design aesthetic.",
    tracks: [
      { number: 1, title: "So What", duration: "9:22" },
      { number: 2, title: "Freddie Freeloader", duration: "9:46" },
      { number: 3, title: "Blue in Green", duration: "5:37" },
      { number: 4, title: "All Blues", duration: "11:33" },
      { number: 5, title: "Flamenco Sketches", duration: "9:26" }
    ]
  },
  {
    id: "17",
    title: "Bitches Brew",
    artist: "Miles Davis",
    year: "1970",
    label: "Columbia",
    genre: "Jazz",
    catalogNumber: "GP 26",
    coverUrl: "https://images.unsplash.com/photo-1571974599782-87624638275d?w=400&h=400&fit=crop&hue=350&sat=90&auto=format&q=80",
    producer: "Teo Macero",
    recordingDate: "August 1969",
    description: "Miles Davis' revolutionary fusion masterpiece that changed jazz forever. This groundbreaking double album features electric instruments and rock-influenced rhythms, with the iconic psychedelic cover art by Mati Klarwein.",
    tracks: [
      { number: 1, title: "Pharaoh's Dance", duration: "20:06" },
      { number: 2, title: "Bitches Brew", duration: "27:00" },
      { number: 3, title: "Spanish Key", duration: "17:32" },
      { number: 4, title: "John McLaughlin", duration: "4:22" },
      { number: 5, title: "Miles Runs the Voodoo Down", duration: "14:04" },
      { number: 6, title: "Sanctuary", duration: "10:56" }
    ]
  },
  {
    id: "18",
    title: "Miles Ahead",
    artist: "Miles Davis",
    year: "1957",
    label: "Columbia",
    genre: "Jazz",
    catalogNumber: "CL 1041",
    coverUrl: "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=400&h=400&fit=crop&hue=120&sat=75&auto=format&q=80",
    producer: "George Avakian",
    recordingDate: "May 1957",
    description: "Miles Davis with Gil Evans' orchestral arrangements creating a unique blend of cool jazz and symphonic textures. This collaboration showcases Miles' flugelhorn work and Evans' masterful orchestrations.",
    tracks: [
      { number: 1, title: "The Maids of Cadiz", duration: "3:47" },
      { number: 2, title: "The Duke", duration: "3:23" },
      { number: 3, title: "My Ship", duration: "4:17" },
      { number: 4, title: "Miles Ahead", duration: "3:28" },
      { number: 5, title: "Blues for Pablo", duration: "5:05" },
      { number: 6, title: "New Rhumba", duration: "4:12" },
      { number: 7, title: "The Meaning of the Blues", duration: "2:47" },
      { number: 8, title: "Lament", duration: "2:20" },
      { number: 9, title: "I Don't Wanna Be Kissed", duration: "3:18" }
    ]
  },
  {
    id: "19",
    title: "In a Silent Way",
    artist: "Miles Davis",
    year: "1969",
    label: "Columbia",
    genre: "Jazz",
    catalogNumber: "CS 9875",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop&hue=280&sat=60&auto=format&q=80",
    producer: "Teo Macero",
    recordingDate: "February 1969",
    description: "Miles Davis' transitional album bridging acoustic and electric jazz, featuring emerging talents like Chick Corea, Joe Zawinul, and John McLaughlin. A pivotal work in the development of jazz fusion.",
    tracks: [
      { number: 1, title: "Shhh/Peaceful", duration: "18:16" },
      { number: 2, title: "In a Silent Way/It's About That Time", duration: "20:01" }
    ]
  }
];