import Login from "@/components/organisms/Login";

export default async function SplashScreen() {
  return (
    <div className="flex flex-row items-center justify-center h-screen">
      <div className="w-3/5 bg-white h-full flex flex-col items-center justify-center">
        <h1 className="text-black text-4xl font-bold">Life Tracker</h1>
        <p className="text-black text-sm text-gray-600">Bienvenido a tu proceso transformador</p>
      </div> 
      <div className="w-2/5 h-full flex items-center justify-center">
        <Login />
      </div>
    </div>
  );
}