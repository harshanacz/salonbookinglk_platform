import Image from "next/image";

export function StylesGallery() {
  // Sample gallery items with different sizes
  const galleryItems = [
    {
      id: 1,
      src: "/placeholder.svg?height=400&width=300",
      alt: "Hairstyle 1",
      className: "row-span-2",
    },
    { id: 2, src: "/placeholder.svg?height=300&width=400", alt: "Nail art 1" },
    { id: 3, src: "/placeholder.svg?height=300&width=300", alt: "Hairstyle 2" },
    {
      id: 4,
      src: "/placeholder.svg?height=400&width=300",
      alt: "Skin care 1",
      className: "row-span-2",
    },
    { id: 5, src: "/placeholder.svg?height=300&width=400", alt: "Nail art 2" },
    { id: 6, src: "/placeholder.svg?height=300&width=300", alt: "Hairstyle 3" },
    { id: 7, src: "/placeholder.svg?height=300&width=400", alt: "Makeup 1" },
    { id: 8, src: "/placeholder.svg?height=300&width=300", alt: "Hairstyle 4" },
    { id: 9, src: "/placeholder.svg?height=300&width=400", alt: "Nail art 3" },
    {
      id: 10,
      src: "/placeholder.svg?height=300&width=300",
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
            src={item.src || "/placeholder.svg"}
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
