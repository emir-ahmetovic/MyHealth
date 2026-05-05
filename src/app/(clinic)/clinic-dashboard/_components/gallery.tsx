"use client"
import React, { useState, useEffect } from "react";
import { ClinicGallery } from "@/components/shared/clinic-gallery";

export default function ClinicGallerySection({ clinicId }: { clinicId: number }) {
  const [images, setImages] = useState<string[]>([]);
  const [imageObjs, setImageObjs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchImages() {
  setLoading(true);
  const res = await fetch(`/api/clinic-gallery?clinicId=${clinicId}`);
  const data = await res.json();
  setImages(data.map((img: any) => img.image_url));
  setImageObjs(data);
  setLoading(false);
  }

  async function handleAdd(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("clinicId", String(clinicId));
    setLoading(true);
    const res = await fetch("/api/clinic-gallery", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      await fetchImages();
    }
    setLoading(false);
  }

  async function handleDelete(url: string) {
    setLoading(true);
    // Find image object by url
    const img = imageObjs.find((img: any) => img.image_url === url);
    if (!img) return setLoading(false);
    const res = await fetch(`/api/clinic-gallery?id=${img.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await fetchImages();
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchImages();
  }, [clinicId]);

  return (
    <div>
      {loading && <div>Učitavanje...</div>}
      <ClinicGallery images={images} onAdd={handleAdd} onDelete={handleDelete} />
    </div>
  );
}
