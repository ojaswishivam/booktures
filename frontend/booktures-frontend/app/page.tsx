"use client";

import { useState, useEffect, useRef } from "react";

type ViewerProps = {
  text: string;
  image: string;
};

function Viewer({ text, image }: ViewerProps) {
  return (
    <div className="
      grid md:grid-cols-2 gap-12 py-16
      border-t border-white/10
    ">
      <div className="
        text-gray-300 text-base leading-relaxed
        max-h-[400px] overflow-y-auto
      ">
        {text}
      </div>

      <img
        src={image}
        className="
          w-full object-cover
          animate-imageReveal
          transition duration-500
          hover:scale-[1.015]
      "
        alt="Preview"
      />
    </div>
  );
}

export default function Home() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    status: "idle",
  });

  const [data, setData] = useState<{ image: string; text: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute("data-index"));
          setCurrentPage(index + 1);
        }
      });
    },
    {
      threshold: 0.6,
    }
  );

  itemRefs.current.forEach((el) => {
    if (el) observer.observe(el);
  });

  return () => observer.disconnect();
  }, [data]);
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    const res = await fetch(`${BASE_URL}/images`);
    const json = await res.json();
    setData(json.data);
  };

  const pollProgress = () => {
    const interval = setInterval(async () => {
      const res = await fetch(`${BASE_URL}/progress`);
      const data = await res.json();

      setProgress(data);

      fetchImages(); // always fetch latest images

      if (data.status === "done") {
        clearInterval(interval);
        setLoading(false);

        //  scroll to results
        setTimeout(() => {
          window.scrollTo({
            top: window.innerHeight * 2,
            behavior: "smooth",
          });
        }, 500);
      }
    }, 1000);
  };

  const uploadFile = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    pollProgress();
  };

  return (
    <main className="
  h-screen overflow-y-scroll snap-y snap-mandatory
  bg-black text-white
">

  {/*  HERO */}
  <section className="
    h-screen flex flex-col items-center justify-center
    text-center
    snap-start opacity-0 animate-fadeIn
  ">
    <p className="text-sm tracking-[0.3em] text-gray-500 mb-4">
      AI VISUAL ENGINE
    </p>

    <h1 className="
      text-[60px] md:text-[120px] font-extrabold leading-none
    ">
      BOOKTURES
    </h1>

    <p className="text-gray-500 mt-4">
      Transform text into visual stories
    </p>
  </section>

  {/*  UPLOAD SECTION */}
  <section className="
    h-screen flex flex-col items-center justify-center
    snap-start opacity-0 animate-fadeIn
  ">
    <div className="text-gray-500 mb-6 tracking-widest">
      01
    </div>

    <div className="flex flex-col items-center gap-6">
      <input 
        id="fileUpload"
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="hidden"
      />
      
      <label
        htmlFor="fileUpload"
        className="
          border border-white/30 px-6 py-3
          text-sm tracking-wide
          cursor-pointer
          hover:bg-white hover:text-black
          transition
        "
      >
        UPLOAD PDF
      </label>

      <button
        disabled={!file}
        onClick={uploadFile}
        className={`
          px-6 py-3 text-sm tracking-wide transition
          ${file 
            ? "bg-white text-black hover:opacity-80" 
            : "bg-white/10 text-gray-500 cursor-not-allowed"}
          `}
      >
        GENERATE
      </button>

      {file && (
        <p className="text-gray-400 text-sm animate-fadeIn">
          {file.name}
        </p>
      )}

      {progress.status === "processing" && (
        <p className="text-gray-400 mt-4">
          {progress.current} / {progress.total}
        </p>
      )}
    </div>
  </section>

  {/*  RESULTS */}
  {data.length > 0 && (
  <section className="
    min-h-screen flex flex-col items-center
    snap-start px-10 py-20
  ">
    <div className="text-gray-500 mb-6 tracking-widest">
      02
    </div>

    <div className="w-full max-w-6xl space-y-16">
      {data.map((item, index) => (
  <div
    key={index}
    ref={(el) => {
      if (el) itemRefs.current[index] = el;
    }}  
    data-index={index}                             
    style={{ animationDelay: `${index * 0.2}s` }}
    className="opacity-0 animate-fadeIn"
  >
    <Viewer
      text={item.text}
      image={item.image}
    />
  </div>
))}
    </div>
  </section>
)}

{data.length > 0 && (
  <div className="
    fixed right-10 top-1/2 -translate-y-1/2
    flex flex-col items-center gap-2
    text-gray-500 text-sm tracking-widest
    opacity-70 hover:opacity-100 transition
  ">
    <div>{currentPage}</div>
    <div className="w-[1px] h-10 bg-white/20"></div>
    <div>{data.length}</div>
  </div>
)}

</main>
  );
}