import Image from "next/image";

export function StylesGallery() {
  const galleryItems = [
    {
      id: 1,
      src: "https://i.ibb.co/xSRd4XCH/1.png",
      alt: "Hairstyle 1",
      className: "row-span-2",
    },
    { 
      id: 2, 
      src: "https://i.ibb.co/mCkB880k/2.png", 
      alt: "Nail art 1" 
    },
    { 
      id: 3, 
      src: "https://i.ibb.co/nqQPsnbL/3.png", 
      alt: "Hairstyle 2" 
    },
    {
      id: 4,
      src: "https://i.ibb.co/XrHkhYRx/4.png",
      alt: "Skin care 1",
      className: "row-span-2",
    },
    { 
      id: 5, 
      src: "https://i.ibb.co/SXJcZtn5/5.png", 
      alt: "Nail art 2" 
    },
    { 
      id: 6, 
      src: "https://i.ibb.co/93C5K3tw/6.png", 
      alt: "Hairstyle 3" 
    },
    { 
      id: 7, 
      src: "https://i.ibb.co/tTQ64fmM/7.png", 
      alt: "Makeup 1" 
    },
    { 
      id: 8, 
      src: "https://i.ibb.co/x8KF7mSh/8.png", 
      alt: "Hairstyle 4" 
    },
    { 
      id: 9, 
      src: "https://i.ibb.co/QFF7nZRx/9.png", 
      alt: "Nail art 3" 
    },
    {
      id: 10,
      src: "https://i.ibb.co/qMjjfCtL/10.png",
      alt: "Skin care 2",
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
