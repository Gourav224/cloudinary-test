import FileUpload from "@/components/FileUpload";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-900 text-gray-100">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-100">
        File Upload with Cloudinary
      </h1>
      <FileUpload />
    </main>
  );
}