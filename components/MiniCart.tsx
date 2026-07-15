"use client";

import { useEffect, useState, useRef } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { readCart, removeFromCart, updateQty, cartSubtotal, CartItem } from "@/lib/cart";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

export default function MiniCart() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSync = () => setItems(readCart());
    const handleOpen = () => {
      handleSync();
      setIsOpen(true);
    };

    handleSync();
    window.addEventListener("cart:updated", handleSync);
    window.addEventListener("cart:open", handleOpen);
    window.addEventListener("storage", handleSync);
    
    return () => {
      window.removeEventListener("cart:updated", handleSync);
      window.removeEventListener("cart:open", handleOpen);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("cart:panel-change", { detail: { isOpen } })
    );
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cartSubtotal(items);

  return (
    <aside 
      ref={containerRef}
      className="fixed right-0 top-0 bottom-0 z-[1000] h-full w-[110px] overflow-visible border-l border-[#d8d8d8] bg-white font-sans flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.1)] animate-in slide-in-from-right duration-300"
    >
        <div className="absolute left-[-12px] top-[88px] h-0 w-0 border-b-[12px] border-r-[12px] border-t-[12px] border-b-transparent border-r-white border-t-transparent drop-shadow-[-1px_0_1px_rgba(0,0,0,0.12)]" />
        <CartHeader subtotal={subtotal} onClose={() => setIsOpen(false)} />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-2">
          {items.length > 0 ? (
            items.map((item) => (
              <CartItemCard 
                key={item.id} 
                item={item} 
                onRemove={() => removeFromCart(item.id)}
                onUpdate={(qty) => updateQty(item.id, qty)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
               <div className="h-20 w-20 flex items-center justify-center rounded-3xl bg-gray-50 mb-6">
                  <ShoppingCart size={32} className="opacity-20" />
               </div>
               <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 leading-none">Your bag is empty</h3>
               <p className="text-[11px] font-medium text-gray-400 mt-2 uppercase tracking-wide">Add some electronics to get started</p>
            </div>
          )}
        </div>
    </aside>
  );
}

function CartHeader({ subtotal, onClose }: { subtotal: number, onClose: () => void }) {
  return (
    <div className="shrink-0 border-b border-gray-100">
      <div className="grid grid-cols-[58px_1fr]">
       

        <div className="flex h-[50px] flex-col items-center justify-center bg-white px-10 pr-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none">Subtotal</span>
          <span className="mt-1 whitespace-nowrap text-[13px] font-black leading-none text-[#d61f26] tracking-tighter">
            UGX {subtotal.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2.5">
        <Link
          href="/cart"
          onClick={onClose}
          className="flex h-[28px] flex-1 items-center justify-center rounded-full bg-[#111827] px-3 text-[9px] font-black uppercase tracking-widest text-white transition-all hover:bg-black active:scale-95 shadow-lg shadow-black/10"
        >
          Go to Cart
        </Link>

      </div>
    </div>
  );
}

function CartItemCard({ 
    item, 
    onRemove, 
    onUpdate 
}: { 
    item: CartItem; 
    onRemove: () => void; 
    onUpdate: (qty: number) => void;
}) {
  return (
    <div className="group border-b border-gray-50 bg-white px-3 py-4 transition-colors hover:bg-blue-50/20">
      <div className="relative flex min-h-[50px] items-center justify-center overflow-hidden rounded-2xl bg-gray-50/50 p-3">
        <SafeImage
          src={item.image}
          alt={item.name}
          width={80}
          height={80}
          sizes="80px"
          className="max-h-[80px] max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        <button 
           onClick={onRemove}
           className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-gray-400 opacity-0 transition-all hover:bg-white hover:text-red-500 group-hover:opacity-100 shadow-sm"
        >
            <Trash2 size={14} strokeWidth={2.4} />
        </button>
      </div>

      <div className="mt-3 px-1 text-center">
        <h4 className="mb-1 min-h-[30px] line-clamp-2 text-[12px] font-bold leading-tight text-gray-800">
          {item.name}
        </h4>
        <p className="text-[13px] font-black leading-none tracking-tight text-[#111]">
          UGX {item.price.toLocaleString()}
        </p>
      </div>

      <div className="mt-4 flex justify-center">
        <div className="flex h-6 w-[90px] items-center justify-between rounded-full border-2 border-[#e5b800] bg-white px-1 shadow-md shadow-yellow-500/10">
          <button
            type="button"
            onClick={() => onUpdate(item.qty - 1)}
            disabled={item.qty <= 1}
            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-black disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={3} />
          </button>

          <span className="w-7 text-center text-[14px] font-black leading-none text-[#0f2b62]">
            {item.qty}
          </span>

          <button
            type="button"
            onClick={() => onUpdate(item.qty + 1)}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-gray-900 transition-all hover:border-yellow-200"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
