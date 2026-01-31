import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileBackButtonProps {
  to?: string;
  label?: string;
}

const MobileBackButton = ({ to = "/dashboard", label = "Voltar" }: MobileBackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(to);
  };

  return (
    <div className="md:hidden mb-4">
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-secondary hover:text-secondary/80"
        onClick={handleBack}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{label}</span>
      </Button>
    </div>
  );
};

export default MobileBackButton;
