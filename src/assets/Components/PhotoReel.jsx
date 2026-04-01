import React from 'react'
import './PhotoReel.css'

const reelImages = [
  "https://huntnewsnu.com/wp-content/uploads/2025/10/IVSteastDiningHalls_5_13_25_ShivWani_9-1-1200x800.jpg",
  "https://news.northeastern.edu/wp-content/uploads/2025/06/061025_MM_Stetson_East_006.jpg?w=1100",
  "https://huntnewsnu.com/wp-content/uploads/2025/05/IVSteastDiningHalls_5_13_25_ShivWani_16.jpg",
  "https://news.northeastern.edu/wp-content/uploads/2018/09/nu_dining_embed.jpg",
  "https://www.pcadesign.com/wp-content/uploads/NU-Curry-Dining_4-1800x1189.jpg",
  "https://news.northeastern.edu/wp-content/uploads/2023/11/111423_AS_Food_Allergies_006.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/International_Village_Dining_Hall.jpg/1920px-International_Village_Dining_Hall.jpg",
  "https://news.northeastern.edu/wp-content/uploads/2023/11/111423_AS_Food_Allergies_004.jpg?w=1100",
]

export default function PhotoReel() {
  return (
    <div className="photo-reel-wrapper">
      <div className="photo-reel-strip top"></div>
      <div className="photo-reel-strip bottom"></div>
      <div className="photo-reel">
        {[...reelImages, ...reelImages].map((src, i) => (
          <div className="reel-frame" key={i}><img src={src} alt="Dining hall" /></div>
        ))}
      </div>
    </div>
  )
}
