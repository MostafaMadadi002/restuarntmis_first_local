import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Star,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  SlidersHorizontal,
  X,
  ChefHat,
  Tag,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Package,
  Layers,
  Check,
  Grid,
  List,
  Search,
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UI';
import { MenuItemData } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface MenuViewProps {
  menuItems: MenuItemData[];
  pointsUnit?: string;
  onToggleAvailability: (itemId: number) => void;
  onUpdatePrice: (itemId: number, newPrice: number) => void;
  onAddMenuItem: (newItem: Omit<MenuItemData, 'id'>) => void;
  onUpdateMenuItem?: (updated: MenuItemData) => void;
  onDeleteMenuItem: (itemId: number) => void;
}

const PRESET_DISH_IMAGES = [
  { label: 'پیتزا ناپولیتن', url: '/src/assets/images/generated_neapolitan_pizza.png' },
  { label: 'پیتزا سیسیلی', url: '/src/assets/images/generated_sicilian_pizza.png' },
  { label: 'سالاد استارباکس', url: '/src/assets/images/generated_starbucks_salad.png' },
  { label: 'کباب سنتی', url: '/src/assets/images/dish_local_kabob_1790490473444.jpg' },
  { label: 'کیک و دسر', url: '/src/assets/images/dish_dessert_cake_1790490513891.jpg' },
];

export function MenuView({
  menuItems,
  pointsUnit = 'امتیاز',
  onToggleAvailability,
  onUpdatePrice,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
}: MenuViewProps) {
  const { t, isRtl, formatPrice, getDishName } = useLanguage();
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');

  // Dish Add / Edit Modal State
  const [isDishModalOpen, setIsDishModalOpen] = useState<boolean>(false);
  const [editingDish, setEditingDish] = useState<MenuItemData | null>(null);

  const [dishName, setDishName] = useState<string>('');
  const [dishCategory, setDishCategory] = useState<string>('پیتزا و فست‌فود');
  const [dishStation, setDishStation] = useState<string>('فست‌فود');
  const [dishPrice, setDishPrice] = useState<string>('');
  const [dishRating, setDishRating] = useState<number>(4.9);
  const [dishLoyaltyReward, setDishLoyaltyReward] = useState<number>(25);
  const [dishDescription, setDishDescription] = useState<string>('');
  const [dishImage, setDishImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const stations = [
    { id: 'ALL', label: t.common.all },
    { id: 'پیتزا و فست‌فود', label: 'پیتزا و فست‌فود' },
    { id: 'غذای مخصوص', label: 'غذای مخصوص' },
    { id: 'غذاهای محلی', label: 'غذاهای محلی' },
    { id: 'دسر', label: 'دسر و سالاد' },
    { id: 'نوشیدنی‌ها', label: 'نوشیدنی‌ها' },
  ];

  const filteredItems = menuItems.filter((i) => {
    const matchesStation =
      selectedStation === 'ALL'
        ? true
        : i.station === selectedStation || i.category_name === selectedStation;
    const matchesSearch =
      searchQuery.trim() === '' ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStation && matchesSearch;
  });

  const handleOpenAddDish = () => {
    setEditingDish(null);
    setDishName('');
    setDishCategory('پیتزا و فست‌فود');
    setDishStation('فست‌فود');
    setDishPrice('14');
    setDishRating(4.9);
    setDishLoyaltyReward(25);
    setDishDescription('');
    setDishImage(PRESET_DISH_IMAGES[0].url);
    setFormError(null);
    setIsDishModalOpen(true);
  };

  const handleOpenEditDish = (item: MenuItemData) => {
    setEditingDish(item);
    setDishName(item.name);
    setDishCategory(item.category_name);
    setDishStation(item.station);
    setDishPrice(String(item.price));
    setDishRating(item.rating || 4.9);
    setDishLoyaltyReward(item.loyalty_points_reward ?? 25);
    setDishDescription(item.description || '');
    setDishImage(item.image || PRESET_DISH_IMAGES[0].url);
    setFormError(null);
    setIsDishModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDishImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) {
      setFormError('لطفاً نام غذا را وارد کنید.');
      return;
    }
    const priceNum = Number(dishPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('لطفاً قیمت معتبر وارد کنید.');
      return;
    }

    if (editingDish) {
      if (onUpdateMenuItem) {
        onUpdateMenuItem({
          ...editingDish,
          name: dishName.trim(),
          category_name: dishCategory,
          station: dishStation,
          price: priceNum,
          rating: dishRating,
          loyalty_points_reward: dishLoyaltyReward,
          description: dishDescription.trim(),
          image: dishImage || editingDish.image,
        });
      }
      setSuccessNotice(`غذای «${dishName}» با موفقیت ویرایش گردید.`);
    } else {
      onAddMenuItem({
        name: dishName.trim(),
        category_id: 1,
        category_name: dishCategory,
        station: dishStation,
        price: priceNum,
        rating: dishRating,
        rating_count: 1,
        is_available: true,
        description: dishDescription.trim(),
        image: dishImage,
        loyalty_points_reward: dishLoyaltyReward,
      });
      setSuccessNotice(`غذای «${dishName}» به منو افزوده شد.`);
    }

    setIsDishModalOpen(false);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="bg-white p-6 md:p-8 border border-stone-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {t.menu.title}
            </h1>
          </div>
          <p className="text-xs text-stone-400 font-medium">
            مدیریت کامل اقلام منو، قیمت‌ها، موجودی زنده، تصاویر و پاداش وفاداری
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Display Mode toggle */}
          <div className="bg-stone-50 p-1 rounded-2xl flex items-center border border-stone-200">
            <button
              onClick={() => setDisplayMode('grid')}
              className={`p-2 rounded-xl transition-all ${
                displayMode === 'grid'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title="نمایش کارت"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDisplayMode('table')}
              className={`p-2 rounded-xl transition-all ${
                displayMode === 'table'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title="نمایش جدول"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAddDish}
            icon={Plus}
            className="rounded-2xl font-bold shadow-md shadow-orange-500/20"
          >
            افزودن غذای جدید
          </Button>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {stations.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStation(st.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all border ${
                selectedStation === st.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-orange-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-200 focus-within:border-orange-500 w-full sm:w-64 transition-all shadow-xs">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="جستجوی غذا..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs font-bold text-stone-900 placeholder-stone-400"
          />
        </div>
      </div>

      {/* Display Mode 1: Modern Food Cards Grid (Mockup Style) */}
      {displayMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:border-orange-200 hover:shadow-xl transition-all flex flex-col justify-between group relative"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 mb-4 group-hover:scale-[1.02] transition-transform">
                  {item.image && item.image.trim() !== '' ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-black text-stone-900 shadow-sm flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.rating || 5.0}</span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-stone-900/75 backdrop-blur-xs text-[10px] font-bold text-white shadow-xs">
                    {item.category_name}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-black text-stone-900 text-base leading-tight group-hover:text-orange-600 transition-colors">
                    {getDishName(item)}
                  </h3>
                </div>

                <p className="text-[11px] text-stone-400 font-medium line-clamp-2 mb-4 leading-relaxed">
                  {item.description || 'آماده‌شده از مرغوب‌ترین مواد اولیه با چاشنی ویژه سرآشپز'}
                </p>
              </div>

              <div>
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block">قیمت:</span>
                    <span className="font-black text-orange-600 text-lg tabular-nums">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  {/* Stock Toggle Pill */}
                  <button
                    type="button"
                    onClick={() => onToggleAvailability(item.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      item.is_available
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}
                  >
                    {item.is_available ? 'موجود' : 'ناموجود'}
                  </button>
                </div>

                {/* Edit & Delete Mini Row */}
                <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-stone-50">
                  <button
                    onClick={() => handleOpenEditDish(item)}
                    className="p-1.5 rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-orange-600 hover:border-orange-200 transition-all text-xs flex items-center gap-1 font-bold"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>ویرایش</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`آیا از حذف غذای «${item.name}» مطمئن هستید؟`)) {
                        onDeleteMenuItem(item.id);
                      }
                    }}
                    className="p-1.5 rounded-xl border border-stone-200 bg-white text-stone-400 hover:text-rose-600 hover:border-rose-200 transition-all text-xs"
                    title="حذف غذا"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Display Mode 2: Clean List Table */
        <Card className="border-stone-100 overflow-hidden bg-white shadow-xs rounded-3xl">
          <div className="overflow-x-auto">
            <table className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-100 text-[11px] font-bold text-stone-400 uppercase">
                  <th className="p-4">نام و تصویر غذا</th>
                  <th className="p-4">دسته‌بندی</th>
                  <th className="p-4">ایستگاه آشپزخانه</th>
                  <th className="p-4">قیمت</th>
                  <th className="p-4">وضعیت موجودی</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-50 border border-stone-200 shrink-0">
                          {item.image && item.image.trim() !== '' ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">{getDishName(item)}</div>
                          <div className="text-[10px] text-stone-400 line-clamp-1">{item.description}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full text-[11px]">
                        {item.category_name}
                      </span>
                    </td>

                    <td className="p-4 font-medium text-stone-500">{item.station}</td>

                    <td className="p-4 font-black text-orange-600 text-sm">
                      {formatPrice(item.price)}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => onToggleAvailability(item.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          item.is_available
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}
                      >
                        {item.is_available ? 'موجود' : 'تمام‌شده'}
                      </button>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditDish(item)}
                          className="p-2 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-orange-600 hover:border-orange-300 transition-all shadow-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`آیا از حذف «${item.name}» مطمئن هستید؟`)) {
                              onDeleteMenuItem(item.id);
                            }
                          }}
                          className="p-2 bg-white border border-stone-200 rounded-xl text-stone-400 hover:text-rose-600 hover:border-rose-300 transition-all shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Dish Modal */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-6 md:p-8 max-w-lg w-full space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-black text-lg text-stone-900">
                  {editingDish ? 'ویرایش غذای منو' : 'افزودن غذای جدید به منو'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">مشخصات، قیمت و تصویر غذا را ثبت کنید</p>
              </div>
              <button onClick={() => setIsDishModalOpen(false)} className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveDish} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1.5">نام غذا</label>
                <input
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="مثلاً: پیتزا پپرونی ویژه"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white text-xs font-bold text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 block mb-1.5">دسته‌بندی</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 text-xs font-bold text-stone-900"
                  >
                    <option value="پیتزا و فست‌فود">پیتزا و فست‌فود</option>
                    <option value="غذای مخصوص">غذای مخصوص</option>
                    <option value="غذاهای محلی">غذاهای محلی</option>
                    <option value="دسر">دسر و سالاد</option>
                    <option value="نوشیدنی‌ها">نوشیدنی‌ها</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 block mb-1.5">قیمت ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    placeholder="14"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1.5">توضیحات و ترکیبات</label>
                <textarea
                  rows={2}
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  placeholder="پنیر موزارلا، سس مخصوص گوجه فرنگی، ریحان تازه..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white text-xs font-medium text-stone-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1.5">انتخاب تصویر</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {PRESET_DISH_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDishImage(preset.url)}
                      className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                        dishImage === preset.url ? 'border-orange-500 scale-105 shadow-xs' : 'border-transparent'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsDishModalOpen(false)}
                  className="w-full rounded-2xl font-bold py-2.5"
                >
                  انصراف
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  className="w-full rounded-2xl font-bold py-2.5"
                >
                  ذخیره غذا
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
