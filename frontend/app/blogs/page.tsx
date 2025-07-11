import React from "react";
import { Heart } from "lucide-react";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <div className="max-w-5xl mx-auto pt-40 pb-12 px-2">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2 flex items-center justify-center gap-3">
          <img src="/AfyaSasa logo.png" alt="AfyaSasa Logo" className="inline-block h-12 w-12 object-contain rounded-full" />
          <span className="text-gray-800">AfyaSasa </span>
          <span className="text-yellow-600">Blog</span>
          <span className="text-gray-800"> Posts</span>
        </h1>
        <p className="text-center text-gray-500 mb-10 text-lg">Tips, research, and clinical insights for women's health and ovarian cyst care</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Blog Card 1 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
            <div className="relative h-48 w-full">
              <Image src="/Normal&OvarianCyst.png" alt="Normal and Ovarian Cyst Anatomy" fill className="object-cover" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-xl font-bold mb-2 text-gray-900">From Myths to Evidence: A Clinical Review of Ovarian Cysts</h2>
              <div className="text-sm text-gray-500 mb-2">Author: AfyaSasa Team &bull; Date: 10th July 2025</div>
              <p className="text-gray-700 mb-4 flex-1">Explore the AfyaSasa Blog for expert insights, research updates, and real-world experiences in ovarian cyst diagnosis and care. Learn about causes, symptoms, treatments, and common myths in a beautifully written, evidence-based article.</p>
              <a href="https://ayfasasa.blogspot.com/2025/06/ovarian-cyst-and-myth-surroundin-it.html" target="_blank" rel="noopener noreferrer" className="block w-full mt-auto">
                <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition">READ MORE</button>
              </a>
            </div>
          </div>
          {/* Blog Card 2 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
            <div className="relative h-48 w-full">
              <Image src="/OvaryCyst.png" alt="Ovary Cyst" fill className="object-cover" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-xl font-bold mb-2 text-gray-900">Understanding Ovarian Cysts: Clinical Insights</h2>
              <div className="text-sm text-gray-500 mb-2">Author: Dr Goodness Nwokebu &bull; Date: 6th July 2025</div>
              <p className="text-gray-700 mb-4 flex-1">Ovarian cysts are fluid-filled sacs that develop on or within an ovary. While most cysts are benign and asymptomatic, some can cause significant clinical symptoms or indicate underlying pathology. Learn about types, risk factors, and management strategies.</p>
              <a href="#" className="block w-full mt-auto">
                <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition">READ MORE</button>
              </a>
            </div>
          </div>
          {/* Blog Card 3 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
            <div className="relative h-48 w-full">
              <Image src="/ovarianCyst.png" alt="Ovarian Cyst" fill className="object-cover" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-xl font-bold mb-2 text-gray-900">Management of Ovarian Cysts in Adolescents</h2>
              <div className="text-sm text-gray-500 mb-2">Author: Dr Goodness Nwokebu &bull; Date: 7th July 2025</div>
              <p className="text-gray-700 mb-4 flex-1">A practical guide to the diagnosis and management of ovarian cysts in adolescent patients, including when to observe, when to refer, and how to counsel families about prognosis and fertility.</p>
              <a href="#" className="block w-full mt-auto">
                <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition">READ MORE</button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 