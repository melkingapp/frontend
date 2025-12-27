import JoinMethodSelector from "../../features/membership/components/JoinMethodSelector";

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <JoinMethodSelector />
      </div>
    </div>
  );
}
