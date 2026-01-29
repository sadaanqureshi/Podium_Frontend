// components/PriceCard.tsx

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

// Iske props 'Card.tsx' se thode alag hain
interface PriceCardProps {
  id: number;
  title: string;
  author: string;
  description: string;
  rating: number;
  price: number;
  imageUrl: string;
}

const PriceCard: React.FC<PriceCardProps> = ({
  id,
  title,
  author,
  description,
  rating,
  price,
  imageUrl,
}) => {
  return (
    <Link href={`/available-courses/${id}`} className="block">
      <div className="w-full h-full rounded-lg overflow-hidden shadow-lg bg-white border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        
        {/* FIX 1: Image height 'h-48' se 'h-36' kar di (Card.tsx jaisi) */}
        <div className="relative w-full h-36">
          <Image
            src={imageUrl}
            alt={`Course image for ${title}`}
            layout="fill"
            objectFit="cover"
          />
        </div>

        {/* FIX 2: Padding 'p-6' se 'p-4' kar di (Card.tsx jaisi) */}
        <div className="p-4">
          <div className="flex justify-between items-center gap-3 mb-2">
            
            {/* FIX 3: Title ki styling Card.tsx se copy kar di */}
            <h3 className="text-lg font-bold text-gray-900">
              {title}
            </h3>
            
            <div className="flex items-center gap-1 text-sm text-gray-700 flex-shrink-0 pt-1">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{rating}</span>
            </div>
          </div>

          {/* FIX 4: Author margin 'mb-3' se 'mb-2' kar diya */}
          <p className="text-blue-600 text-sm font-semibold mb-2">
            {author}
          </p>

          {/* FIX 5: Description ki styling Card.tsx se copy kar di */}
          <p className="text-gray-600 text-sm mb-2">
            {description}
          </p>

          {/* FIX 6: Price badge ki styling ko card ke size ke hisaab se adjust kiya */}
          <div className="mt-2"> {/* Margin ko 'mt-4' se 'mt-2' kar diya */}
            <span className="bg-green-100 text-green-800 text-base font-bold px-3 py-1 rounded-full"> {/* Size 'lg' se 'base' kar diya */}
              ${price}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PriceCard;