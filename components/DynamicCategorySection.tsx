"use client";

import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { useFrontendData } from "@/lib/use-frontend-data";

export default function DynamicCategorySection() {
    const { data } = useFrontendData();
    const categories = data.categories || [];

    const visibleCategories = categories
        .filter((category) => category.isActive)
        .sort((a, b) => {
            if (a.isFeatured !== b.isFeatured) {
                return a.isFeatured ? -1 : 1;
            }
            return a.order - b.order;
        });

    if (visibleCategories.length === 0) return null;

    return (
        <section className="w-full bg-[#f9f9f9] py-12">
            <div className="mx-auto max-w-[1400px] px-4">
                <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
                    <h2 className="text-[24px] font-bold tracking-tight text-gray-900 sm:text-[28px]">
                        Categories
                    </h2>
                    <Link
                        href="/categories"
                        className="text-[14px] font-semibold text-[#0b63ce] hover:underline"
                    >
                        View All Categories
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                    {visibleCategories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            className="group flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-all duration-300 hover:border-[#f6c400] hover:shadow-md"
                        >
                            <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-50 p-2 ring-1 ring-gray-100 transition-all group-hover:ring-[#f6c400]">
                                {cat.thumbnail ? (
                                    <SafeImage
                                        src={cat.thumbnail}
                                        alt={cat.title}
                                        width={64}
                                        height={64}
                                        sizes="64px"
                                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                                    />
                                ) : (
                                    <ImageIcon className="h-6 w-6 text-gray-300" />
                                )}
                            </div>
                            <span className="text-[13px] font-bold leading-tight text-gray-800 transition-colors group-hover:text-[#0b63ce]">
                                {cat.title}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
