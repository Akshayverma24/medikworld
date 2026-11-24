import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Building2, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

const MedicineCard = ({ medicine }) => {
  const {
    _id,
    name,
    genericName,
    category,
    manufacturer,
    dosage,
    form,
    mrp,
    lowestPrice,
    availablePharmaciesCount = 0,
    prescriptionRequired,
    image,
  } = medicine;

  const inStock = availablePharmaciesCount > 0;
  const discount =
    mrp && lowestPrice && mrp > lowestPrice
      ? Math.round(((mrp - lowestPrice) / mrp) * 100)
      : 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Card Header & Image */}
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        <img
          src={image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-transparent to-transparent"></div>

        {/* Prescription Tag */}
        {prescriptionRequired ? (
          <span className="absolute top-3 left-3 bg-rose-500/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Rx Required
          </span>
        ) : (
          <span className="absolute top-3 left-3 bg-teal-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            OTC
          </span>
        )}

        {/* Form Badge (Tablet/Syrup) */}
        <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
          {form} • {dosage}
        </span>

        {/* Category at bottom of image */}
        <span className="absolute bottom-2.5 left-3 text-[11px] font-semibold text-sky-200 bg-slate-950/70 backdrop-blur-xs px-2.5 py-0.5 rounded-md">
          {category}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
            {name}
          </h3>
          <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
            Salt: <span className="text-slate-700">{genericName}</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            By <span className="text-slate-600 font-medium">{manufacturer}</span>
          </p>
        </div>

        {/* Availability Badge */}
        <div className="my-3 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs">
            {inStock ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-semibold text-teal-700">
                  In Stock ({availablePharmaciesCount} {availablePharmaciesCount === 1 ? 'store' : 'stores'})
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-amber-700">Check availability</span>
              </>
            )}
          </div>
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              From
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900">
                ₹{lowestPrice !== undefined ? lowestPrice : mrp}
              </span>
              {mrp > (lowestPrice || mrp) && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{mrp}
                </span>
              )}
              {discount > 0 && (
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                  {discount}% OFF
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/medicines/${_id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-600 hover:text-white rounded-xl transition-all duration-200 group/btn shadow-xs"
          >
            <span>Compare</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;
