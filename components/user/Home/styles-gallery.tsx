import Image from "next/image";

export function StylesGallery() {
  const galleryItems = [
    {
      id: 1,
      src: "https://i.ibb.co/ycb5Hppg/1.png",
      alt: "Hairstyle 1",
      className: "row-span-2",
    },
    { 
      id: 2, 
      src: "https://i.ibb.co/GvtbYrts/2.png", 
      alt: "Nail art 1" 
    },
    { 
      id: 3, 
      src: "https://i.ibb.co/27Ymxj39/3.png", 
      alt: "Hairstyle 2" 
    },
    {
      id: 4,
      src: "https://i.ibb.co/W4wDFjjk/4.png",
      alt: "Skin care 1",
      className: "row-span-2",
    },
    { 
      id: 5, 
      src: "https://i.ibb.co/bgvJDDc7/5.png", 
      alt: "Nail art 2" 
    },
    { 
      id: 6, 
      src: "https://i.ibb.co/1GcbcLB4/6.png", 
      alt: "Hairstyle 3" 
    },
    { 
      id: 7, 
      src: "https://i.ibb.co/PZNhgtBX/7.png", 
      alt: "Makeup 1" 
    },
    { 
      id: 8, 
      src: "https://i.ibb.co/FkXF3MCr/8.png", 
      alt: "Hairstyle 4" 
    },
    { 
      id: 9, 
      src: "https://i.ibb.co/WjDTgH9/9.png", 
      alt: "Nail art 3" 
    },{ 
      id: 10, 
      src: "https://i.ibb.co/1GcbcLB4/6.png", 
      alt: "Hairstyle 3" 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-min">
      {galleryItems.map((item) => (
        <div
          key={item.id}
          className={`relative overflow-hidden rounded-lg ${
            item.className || ""
          }`}
        >
          <Image
            src={item.src}
            alt={item.alt}
            width={400}
            height={300}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  );
}
