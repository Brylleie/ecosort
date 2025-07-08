import { useNavigate } from "react-router-dom";
import heroImg from "../assets/rewards.png";
import { FaRecycle, FaCoins, FaGift } from "react-icons/fa";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-100 via-lime-200 to-green-300 flex flex-col overflow-hidden font-sans text-white">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 text-green-300 text-4xl opacity-30 select-none">♻️</div>
      <div className="absolute bottom-24 right-10 text-green-400 text-5xl opacity-20 select-none">🍃</div>
      <div className="absolute top-8 right-28 text-green-500 text-3xl opacity-10 select-none">🗑️</div>
      <div className="absolute left-1/3 bottom-12 text-6xl opacity-10">🌎</div>

      {/* Intro Section */}
      <section className="flex justify-center items-center w-full mt-12 z-10">
        <div className="text-center px-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">
            Welcome to ECOSORT ♻️
          </h1>
          <p className="text-green-900 text-base sm:text-lg">
            Empowering communities to recycle smarter and earn rewards. Let's clean, sort, and make every action count!
          </p>
        </div>
      </section>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col-reverse lg:flex-row items-center justify-center gap-10 px-4 sm:px-6 py-10 z-10 relative">
        {/* Text Content */}
        <div className="max-w-lg text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-lime-700 leading-tight mb-4">
            Turn Trash Into Rewards
          </h1>
          <p className="text-green-900 text-base sm:text-lg mb-6">
            Join your community in making a difference. Segregate waste, earn points, and redeem goods that matter to you. Save the planet one plastic bottle at a time.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="bg-gradient-to-r from-lime-500 to-green-600 hover:brightness-110 text-white py-2.5 px-6 rounded-full font-bold text-sm shadow-lg"
          >
            Get Started Now
          </button>
        </div>

        {/* Hero Image */}
        <div className="max-w-xs animate-float">
          <div className="rounded-full border-4 border-green-400 shadow-[rgba(0,0,0,0.4)_0px_8px_20px] p-2 bg-white transition-transform duration-300 hover:scale-105">
            <img
              src={heroImg}
              alt="Recycling Hero"
              className="w-full h-auto rounded-full object-cover"
            />
          </div>
        </div>
      </main>

      {/* Onboarding Steps */}
      <section className="px-6 py-12 bg-transparent text-green-900 text-center">
        <h3 className="text-xl font-bold mb-6">How ECOSORT Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <FaRecycle className="text-4xl text-green-600 mb-3 animate-float" />
            <h4 className="font-semibold">Recycle</h4>
            <p className="text-sm">Sort your recyclable waste and submit it to your local center.</p>
          </div>
          <div className="flex flex-col items-center">
            <FaCoins className="text-4xl text-yellow-500 mb-3 animate-float-reverse" />
            <h4 className="font-semibold">Earn</h4>
            <p className="text-sm">Receive EcoPoints for every verified waste item you submit.</p>
          </div>
          <div className="flex flex-col items-center">
            <FaGift className="text-4xl text-pink-500 mb-3 animate-float" />
            <h4 className="font-semibold">Redeem</h4>
            <p className="text-sm">Use your points to claim goods, essentials, and community rewards.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-xs text-center text-green-900 py-6 relative z-10">
        <p>♻️ Collection every Thursday morning • Brgy. T. Alonzo</p>
        <p className="mt-1">Contact: taonzo@gmail.com • 0912 345 6789</p>
      </footer>

      {/* Tailwind animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(20px); }
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 8s ease-in-out infinite; }
        .animate-fadein { animation: fadein 1.2s ease-out forwards; }
      `}</style>
    </div>
  );
}
