"use client";

import React from "react";
import { UploadButton } from "@/lib/uploadthing";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Upload } from "lucide-react";
import Image from "next/image";

interface ServiceImagesProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export default function ServiceImages({ images, onImagesChange }: ServiceImagesProps) {
  const { toast } = useToast();

  const handleUploadComplete = (res: any) => {
    if (res) {
      const newUrls = res.map((file: any) => file.url);
      const updatedImages = [...images, ...newUrls].slice(0, 3);
      onImagesChange(updatedImages);
      toast({ description: "Image(s) uploaded successfully." });
    }
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const mainImage = newImages[0];
    newImages[0] = newImages[index];
    newImages[index] = mainImage;
    onImagesChange(newImages);
    toast({ description: "Main image updated." });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast({ description: "Image removed." });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div key={url} className="relative group">
            <div className="aspect-square relative rounded-lg overflow-hidden border">
              <Image
                src={url}
                alt={`Service image ${index + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
                <div className="absolute top-2 left-2 flex items-center gap-2">
                  {index === 0 ? (
                    <span className="bg-yellow-400 text-xs px-2 py-1 rounded-full">
                      Main Image
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetMainImage(index)}
                      className="bg-white hover:bg-gray-100 text-xs"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Set as Main
                    </Button>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-md"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {images.length < 3 && (
          <div className="aspect-square relative rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 transition-colors duration-200 flex flex-col items-center justify-center">
            <style jsx global>{`
              .ut-upload-btn {
                padding: 0 !important;
                min-width: 40px !important;
                min-height: 40px !important;
                width: 40px !important;
                height: 40px !important;
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0 !important;
              }
              .ut-upload-btn span {
                display: none !important;
              }
            `}</style>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={handleUploadComplete}
              onUploadError={(error: Error) => {
                toast({
                  title: "Upload Error",
                  description: error.message,
                  variant: "destructive",
                });
              }}
            />
            <span className="text-xs text-gray-500 mt-2">Add</span>
          </div>
        )}
      </div>
    </div>
  );
} 