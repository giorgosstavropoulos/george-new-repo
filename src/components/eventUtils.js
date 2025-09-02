export function getEventDescription(event) {
  switch (event?.artist) {
    case 'Neon Pulse':
      return 'Experience a night of electrifying beats and neon lights as Neon Pulse takes the stage. Perfect for fans of futuristic dance music.';
    case 'Synthwave Collective':
      return 'Dive into retro-futuristic vibes with Synthwave Collective. Expect synth-heavy tracks and a dazzling light show.';
    case 'Electric Dreams':
      return 'Electric Dreams brings you a blend of electronic rhythms and dreamy melodies. A must-see for lovers of immersive soundscapes.';
    case 'Retro Vibes':
      return 'Get ready to groove to classic and modern dance hits with Retro Vibes. A nostalgic journey with a modern twist.';
    case 'Future Beats':
      return 'Future Beats delivers cutting-edge music and energetic performances. Join the crowd for a night of innovation and rhythm.';
    case 'Night Synths':
      return 'Night Synths creates a mesmerizing atmosphere with deep synths and pulsing bass. Dance the night away in style.';
    case 'Midnight Echoes':
      return 'Midnight Echoes will captivate you with haunting melodies and powerful dance anthems. An unforgettable late-night experience.';
    case 'Laser Groove':
      return 'Laser Groove combines high-energy dance tracks with a spectacular laser show. Don’t miss this visual and musical feast.';
    case 'Pulse Machine':
      return 'Pulse Machine brings relentless energy and infectious beats. Perfect for those who love to move and feel the music.';
    case 'Synth City':
      return 'Synth City offers a cityscape of sound, blending urban rhythms with synth magic. A unique event for music explorers.';
    case 'Neon Nights':
      return 'Neon Nights lights up the club with vibrant colors and dynamic dance music. Join the party and shine bright.';
    case 'Retro Future':
      return 'Retro Future fuses past and future sounds for a truly original dance experience. Step into tomorrow with a touch of nostalgia.';
    default:
      return 'Join us for an amazing night of music, dance, and unforgettable memories!';
  }
}
