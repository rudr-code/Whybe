import { useState, useEffect } from "react";
import api from "../../api/axios";
import MessMenuCard from "../../components/MessMenuCard";

export default function StudentMessMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        const { data } = await api.get("/mess-menu");
        setMenu(data);
      } catch (err) {
        console.error("Failed to load mess menu", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Hostel Dining & Mess Schedule</h1>
        <p className="text-xs text-slate mt-0.5">
          Weekly breakfast, lunch, tea-time snacks, and dinner meal menu &middot; Mess Block B
        </p>
      </div>

      <MessMenuCard menuList={menu} />

      {/* Guidelines & Committee Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-platinum rounded-2xl p-5 shadow-sm">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-ink mb-2">
            Dining Timings
          </h4>
          <ul className="text-xs text-slate space-y-1.5 font-medium">
            <li>Breakfast: 07:30 AM &ndash; 09:30 AM</li>
            <li>Lunch: 12:30 PM &ndash; 02:30 PM</li>
            <li>Evening Snacks: 05:00 PM &ndash; 06:15 PM</li>
            <li>Dinner: 07:45 PM &ndash; 09:45 PM</li>
          </ul>
        </div>

        <div className="bg-white border border-platinum rounded-2xl p-5 shadow-sm">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-ink mb-2">
            Hostel Mess Committee
          </h4>
          <p className="text-xs text-slate leading-relaxed">
            The student mess committee reviews menu hygiene and ingredients weekly. To submit feedback, contact the hostel manager or use the message portal.
          </p>
        </div>

        <div className="bg-white border border-platinum rounded-2xl p-5 shadow-sm">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-ink mb-2">
            Special Diet & Sick Diet
          </h4>
          <p className="text-xs text-slate leading-relaxed">
            Students requiring sick diet (Khichdi, curd, boiled vegetables) can request meal delivery by notifying the mess counter 1 hour prior.
          </p>
        </div>
      </div>
    </div>
  );
}
