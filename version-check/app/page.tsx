import Image from "next/image";

export default function Home() {
  return (
    <main>
      <Image
        src="/its.png"
        width={1920}
        height={400}
        alt="Office of ITS Logo"
        priority
      />
    </main>
  );
}
