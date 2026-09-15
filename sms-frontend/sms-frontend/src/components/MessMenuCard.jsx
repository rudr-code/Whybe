import { useState } from "react";

export default function MessMenuCard({ menuList = [] }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const currentDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const [activeDay, setActiveDay] = useState(currentDayName);

  const selectedMenu = menuList.find(
    (m) => m.day?.toLowerCase() === activeDay.toLowerCase()
  ) || {
    day: activeDay,
    breakfast: "Poha, Boiled Eggs / Banana, Tea / Coffee",
    lunch: "Dal Tadka, Steamed Rice, Seasonal Veg, Roti, Salad",
    snacks: "Samosa / Biscuits, Hot Masala Tea",
    dinner: "Paneer Butter Masala, Jeera Rice, Chapati, Kheer",
  };

  const meals = [
    { title: "Breakfast", time: "07:30 AM - 09:30 AM", icon: "🍳", items: selectedMenu.breakfast },
    { title: "Lunch", time: "12:30 PM - 02:30 PM", icon: "🍛", items: selectedMenu.lunch },
    { title: "Evening Snacks", time: "05:00 PM - 06:15 PM", icon: "☕", items: selectedMenu.snacks },
    { title: "Dinner", time: "07:45 PM - 09:45 PM", icon: "🍲", items: selectedMenu.dinner },
  ];

  return (
    <div className="bg-white border border-platinum rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
            <span>Hostel Mess Menu</span>
            <span className="text-xs font-normal text-slate">Weekly Rotation</span>
          </h3>
          <p className="text-xs text-slate mt-0.5">Fresh, hygienic meals served daily in the dining hall</p>
        </div>

        {/* Day selector pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {days.map((d) => {
            const isSelected = activeDay.toLowerCase() === d.toLowerCase();
            const isToday = currentDayName.toLowerCase() === d.toLowerCase();
            return (
              <button
                key={d}
                type="button"
                onClick={() => setActiveDay(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-jet text-white shadow-sm"
                    : "bg-paper text-slate hover:text-ink hover:bg-platinum/40"
                }`}
              >
                {d.slice(0, 3)}
                {isToday && <span className="ml-1 text-[8px] text-emerald">&bull;</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {meals.map((meal) => (
          <div
            key={meal.title}
            className="p-4 rounded-xl border border-platinum bg-paper hover:bg-white hover:border-emerald/40 transition-all duration-150 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{meal.icon}</span>
              <span className="text-[10px] font-mono text-slate bg-white px-2 py-0.5 rounded-md border border-platinum">
                {meal.time}
              </span>
            </div>
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-2 group-hover:text-emerald transition-colors">
              {meal.title}
            </h4>
            <p className="text-xs text-slate leading-relaxed font-medium">
              {meal.items || "Menu items will be updated shortly"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
