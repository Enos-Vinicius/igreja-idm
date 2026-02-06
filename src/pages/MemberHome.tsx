import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Calendar as CalendarIcon,
  Heart,
  User,
  Mail,
  Phone,
  Cake,
  Church,
  Music,
  BookOpen,
  Edit,
  ChevronRight,
  Loader2,
  TrendingUp,
  CheckCircle2,
  PartyPopper,
  CreditCard,
  QrCode,
  X,
  Printer,
  LayoutDashboard
} from "lucide-react";
import { format, differenceInYears, isSameDay, getMonth, getDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { schedulesService } from "@/services/schedules";
import { membersService } from "@/services/members";
import { Schedule } from "@/types/schedule";
import { Member } from "@/types/member";
import BirthdayConfetti from "@/components/BirthdayConfetti";
import heroRoad from "@/assets/hero-road.jpg";
import logoWhite from "@/assets/logo-white.png";
import logoClean from "@/assets/logo-clean.png";

const MemberHome = () => {
  const navigate = useNavigate();
  const { logout, user, refreshUser } = useAuth();
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [showBirthdayAnimation, setShowBirthdayAnimation] = useState(false);

  // Modal states
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMemberCardModal, setShowMemberCardModal] = useState(false);
  const [baptismDate, setBaptismDate] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGradient, setSelectedGradient] = useState(() => {
    const saved = localStorage.getItem('memberCardGradient');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showCardBack, setShowCardBack] = useState(false);

  // Salva a escolha do gradiente no localStorage
  useEffect(() => {
    localStorage.setItem('memberCardGradient', selectedGradient.toString());
  }, [selectedGradient]);

  // Gradientes disponíveis para a carteirinha
  const cardGradients = [
    `radial-gradient(at 72.72211768092328% 42.83681399438808%, hsla(165, 80.48780487804878%, 67.84313725490196%, 1) 0%, hsla(165, 80.48780487804878%, 67.84313725490196%, 0) 100%), radial-gradient(at 19.0949269145557% 13.427974277640331%, hsla(240.78602620087332, 100%, 55.09803921568628%, 1) 0%, hsla(240.78602620087332, 100%, 55.09803921568628%, 0) 100%), radial-gradient(at 77.31948969476554% 71.73320898669479%, hsla(232.83018867924528, 88.82681564245813%, 64.90196078431373%, 1) 0%, hsla(232.83018867924528, 88.82681564245813%, 64.90196078431373%, 0) 100%), radial-gradient(at 23.873352541680283% 85.21449191849379%, hsla(165, 80.48780487804878%, 67.84313725490196%, 1) 0%, hsla(165, 80.48780487804878%, 67.84313725490196%, 0) 100%), radial-gradient(at 63.94871849560857% 8.657258621326536%, hsla(240.78602620087332, 100%, 55.09803921568628%, 1) 0%, hsla(240.78602620087332, 100%, 55.09803921568628%, 0) 100%), radial-gradient(at 62.90956700488586% 87.01821271111223%, hsla(232.83018867924528, 88.82681564245813%, 64.90196078431373%, 1) 0%, hsla(232.83018867924528, 88.82681564245813%, 64.90196078431373%, 0) 100%), radial-gradient(at 75.44570214827773% 2.6279076304641436%, hsla(165, 80.48780487804878%, 67.84313725490196%, 1) 0%, hsla(165, 80.48780487804878%, 67.84313725490196%, 0) 100%)`,
    `radial-gradient(at 69.4291199669751% 78.1406122314832%, hsla(177.30941704035874, 100%, 43.72549019607843%, 1) 0%, hsla(177.30941704035874, 100%, 43.72549019607843%, 0) 100%), radial-gradient(at 36.07796855155798% 24.237017416445195%, hsla(213.23741007194243, 83.23353293413173%, 67.25490196078432%, 1) 0%, hsla(213.23741007194243, 83.23353293413173%, 67.25490196078432%, 0) 100%), radial-gradient(at 4.573362659429114% 33.767936400266784%, hsla(233.76, 95.41984732824429%, 74.31372549019608%, 1) 0%, hsla(233.76, 95.41984732824429%, 74.31372549019608%, 0) 100%), radial-gradient(at 57.9191435195876% 0.07389016236918344%, hsla(273.23741007194246, 83.23353293413173%, 67.25490196078432%, 1) 0%, hsla(273.23741007194246, 83.23353293413173%, 67.25490196078432%, 0) 100%), radial-gradient(at 5.4342240682024645% 99.40344091432365%, hsla(177.30941704035874, 100%, 43.72549019607843%, 1) 0%, hsla(177.30941704035874, 100%, 43.72549019607843%, 0) 100%), radial-gradient(at 29.465772393031276% 74.13721632164103%, hsla(213.23741007194243, 83.23353293413173%, 67.25490196078432%, 1) 0%, hsla(213.23741007194243, 83.23353293413173%, 67.25490196078432%, 0) 100%), radial-gradient(at 62.8799173732449% 10.097606000731908%, hsla(233.76, 95.41984732824429%, 74.31372549019608%, 1) 0%, hsla(233.76, 95.41984732824429%, 74.31372549019608%, 0) 100%), radial-gradient(at 48.86456319391004% 12.433893354071191%, hsla(273.23741007194246, 83.23353293413173%, 67.25490196078432%, 1) 0%, hsla(273.23741007194246, 83.23353293413173%, 67.25490196078432%, 0) 100%), radial-gradient(at 54.28536155273582% 29.218142226990462%, hsla(177.30941704035874, 100%, 43.72549019607843%, 1) 0%, hsla(177.30941704035874, 100%, 43.72549019607843%, 0) 100%), radial-gradient(at 67.36623049472617% 98.0015829454077%, hsla(213.23741007194243, 83.23353293413173%, 67.25490196078432%, 1) 0%, hsla(213.23741007194243, 83.23353293413173%, 67.25490196078432%, 0) 100%), radial-gradient(at 78.03241274736274% 36.969871392377975%, hsla(233.76, 95.41984732824429%, 74.31372549019608%, 1) 0%, hsla(233.76, 95.41984732824429%, 74.31372549019608%, 0) 100%)`,
    `radial-gradient(at 14.007803339949309% 76.8380365713353%, hsla(303.40425531914894, 89.80891719745226%, 69.2156862745098%, 1) 0%, hsla(303.40425531914894, 89.80891719745226%, 69.2156862745098%, 0) 100%), radial-gradient(at 32.38508352967262% 92.75816299512638%, hsla(213.19148936170214, 89.80891719745226%, 69.2156862745098%, 1) 0%, hsla(213.19148936170214, 89.80891719745226%, 69.2156862745098%, 0) 100%), radial-gradient(at 42.960075979183564% 43.98401133147072%, hsla(303.40425531914894, 89.80891719745226%, 69.2156862745098%, 1) 0%, hsla(303.40425531914894, 89.80891719745226%, 69.2156862745098%, 0) 100%), radial-gradient(at 38.90790442032363% 54.05357757190315%, hsla(213.19148936170214, 89.80891719745226%, 69.2156862745098%, 1) 0%, hsla(213.19148936170214, 89.80891719745226%, 69.2156862745098%, 0) 100%), radial-gradient(at 89.4069625361938% 44.6378359265186%, hsla(303.40425531914894, 89.80891719745226%, 69.2156862745098%, 1) 0%, hsla(303.40425531914894, 89.80891719745226%, 69.2156862745098%, 0) 100%), radial-gradient(at 14.821660230731993% 21.454594190083%, hsla(213.19148936170214, 89.80891719745226%, 69.2156862745098%, 1) 0%, hsla(213.19148936170214, 89.80891719745226%, 69.2156862745098%, 0) 100%), radial-gradient(at 98.49851908617309% 80.17906665897641%, hsla(303.40425531914894, 89.80891719745226%, 69.2156862745098%, 1) 0%, hsla(303.40425531914894, 89.80891719745226%, 69.2156862745098%, 0) 100%), radial-gradient(at 93.83082815864046% 4.62063417776426%, hsla(213.19148936170214, 89.80891719745226%, 69.2156862745098%, 1) 0%, hsla(213.19148936170214, 89.80891719745226%, 69.2156862745098%, 0) 100%), radial-gradient(at 28.031740385595107% 48.61083899642389%, hsla(303.40425531914894, 89.80891719745226%, 69.2156862745098%, 1) 0%, hsla(303.40425531914894, 89.80891719745226%, 69.2156862745098%, 0) 100%), radial-gradient(at 68.4382612476962% 93.72930438497964%, hsla(213.19148936170214, 89.80891719745226%, 69.2156862745098%, 1) 0%, hsla(213.19148936170214, 89.80891719745226%, 69.2156862745098%, 0) 100%), radial-gradient(at 87.52898121872296% 2.460973735519878%, hsla(303.40425531914894, 89.80891719745226%, 69.2156862745098%, 1) 0%, hsla(303.40425531914894, 89.80891719745226%, 69.2156862745098%, 0) 100%)`,
    `radial-gradient(at 86.93459383865547% 8.116375986059833%, hsla(192.85714285714286, 85.36585365853661%, 32.15686274509804%, 1) 0%, hsla(192.85714285714286, 85.36585365853661%, 32.15686274509804%, 0) 100%), radial-gradient(at 35.68450632544777% 5.131342280085782%, hsla(222.85714285714286, 85.36585365853661%, 32.15686274509804%, 1) 0%, hsla(222.85714285714286, 85.36585365853661%, 32.15686274509804%, 0) 100%), radial-gradient(at 39.070849193718146% 42.41280443074278%, hsla(252.8571428571429, 85.36585365853661%, 32.15686274509804%, 1) 0%, hsla(252.8571428571429, 85.36585365853661%, 32.15686274509804%, 0) 100%), radial-gradient(at 47.768762660062% 55.19825228747055%, hsla(192.85714285714286, 85.36585365853661%, 32.15686274509804%, 1) 0%, hsla(192.85714285714286, 85.36585365853661%, 32.15686274509804%, 0) 100%), radial-gradient(at 72.37439647195258% 65.9259150692403%, hsla(222.85714285714286, 85.36585365853661%, 32.15686274509804%, 1) 0%, hsla(222.85714285714286, 85.36585365853661%, 32.15686274509804%, 0) 100%), radial-gradient(at 78.6105674028747% 97.13625849799352%, hsla(252.8571428571429, 85.36585365853661%, 32.15686274509804%, 1) 0%, hsla(252.8571428571429, 85.36585365853661%, 32.15686274509804%, 0) 100%), radial-gradient(at 39.760024518271855% 36.05064608376396%, hsla(192.85714285714286, 85.36585365853661%, 32.15686274509804%, 1) 0%, hsla(192.85714285714286, 85.36585365853661%, 32.15686274509804%, 0) 100%), radial-gradient(at 75.37333751578576% 6.165644396272962%, hsla(222.85714285714286, 85.36585365853661%, 32.15686274509804%, 1) 0%, hsla(222.85714285714286, 85.36585365853661%, 32.15686274509804%, 0) 100%), radial-gradient(at 51.13399889513632% 86.16427481688575%, hsla(252.8571428571429, 85.36585365853661%, 32.15686274509804%, 1) 0%, hsla(252.8571428571429, 85.36585365853661%, 32.15686274509804%, 0) 100%)`,
    `radial-gradient(at 26.287589776540376% 28.03353979481389%, hsla(157.26027397260273, 98.20627802690584%, 56.27450980392157%, 1) 0%, hsla(157.26027397260273, 98.20627802690584%, 56.27450980392157%, 0) 100%), radial-gradient(at 66.77541982726447% 65.43581801223306%, hsla(263.2978723404255, 100%, 63.13725490196078%, 1) 0%, hsla(263.2978723404255, 100%, 63.13725490196078%, 0) 100%), radial-gradient(at 18.054078441139932% 36.62385245736341%, hsla(40.94117647058823, 100%, 50%, 1) 0%, hsla(40.94117647058823, 100%, 50%, 0) 100%), radial-gradient(at 51.18142675681152% 93.95030197277205%, hsla(13.424657534246574, 98.20627802690584%, 56.27450980392157%, 1) 0%, hsla(13.424657534246574, 98.20627802690584%, 56.27450980392157%, 0) 100%), radial-gradient(at 77.40218685375426% 62.971089939960564%, hsla(157.26027397260273, 98.20627802690584%, 56.27450980392157%, 1) 0%, hsla(157.26027397260273, 98.20627802690584%, 56.27450980392157%, 0) 100%), radial-gradient(at 85.47085687585773% 99.89162268491481%, hsla(263.2978723404255, 100%, 63.13725490196078%, 1) 0%, hsla(263.2978723404255, 100%, 63.13725490196078%, 0) 100%)`,
    `radial-gradient(at 66.2743205270445% 29.171995761339975%, hsla(138.1818181818182, 70.2127659574468%, 63.13725490196078%, 1) 0%, hsla(138.1818181818182, 70.2127659574468%, 63.13725490196078%, 0) 100%), radial-gradient(at 16.986797400702812% 65.00645831135834%, hsla(201.9047619047619, 100%, 49.411764705882355%, 1) 0%, hsla(201.9047619047619, 100%, 49.411764705882355%, 0) 100%), radial-gradient(at 59.67558685776082% 98.31922361167582%, hsla(276.7924528301887, 56.989247311827974%, 63.52941176470588%, 1) 0%, hsla(276.7924528301887, 56.989247311827974%, 63.52941176470588%, 0) 100%), radial-gradient(at 72.83320572187068% 9.787015971832446%, hsla(343.3112582781457, 100%, 70.3921568627451%, 1) 0%, hsla(343.3112582781457, 100%, 70.3921568627451%, 0) 100%), radial-gradient(at 91.07461791830178% 90.61610586551183%, hsla(48.18181818181818, 70.2127659574468%, 63.13725490196078%, 1) 0%, hsla(48.18181818181818, 70.2127659574468%, 63.13725490196078%, 0) 100%), radial-gradient(at 99.29035950692028% 51.8453560864311%, hsla(138.1818181818182, 70.2127659574468%, 63.13725490196078%, 1) 0%, hsla(138.1818181818182, 70.2127659574468%, 63.13725490196078%, 0) 100%), radial-gradient(at 75.91650073169004% 54.3300100787635%, hsla(201.9047619047619, 100%, 49.411764705882355%, 1) 0%, hsla(201.9047619047619, 100%, 49.411764705882355%, 0) 100%), radial-gradient(at 31.367415596410453% 80.49949698414905%, hsla(276.7924528301887, 56.989247311827974%, 63.52941176470588%, 1) 0%, hsla(276.7924528301887, 56.989247311827974%, 63.52941176470588%, 0) 100%), radial-gradient(at 22.346804386476137% 49.74824524328132%, hsla(343.3112582781457, 100%, 70.3921568627451%, 1) 0%, hsla(343.3112582781457, 100%, 70.3921568627451%, 0) 100%), radial-gradient(at 14.693324184177591% 4.641528721129684%, hsla(48.18181818181818, 70.2127659574468%, 63.13725490196078%, 1) 0%, hsla(48.18181818181818, 70.2127659574468%, 63.13725490196078%, 0) 100%), radial-gradient(at 21.29676640338978% 4.215177650357105%, hsla(138.1818181818182, 70.2127659574468%, 63.13725490196078%, 1) 0%, hsla(138.1818181818182, 70.2127659574468%, 63.13725490196078%, 0) 100%)`,
    `radial-gradient(at 96.13735746565624% 80.17190943240347%, hsla(219.21787709497207, 100%, 35.09803921568627%, 1) 0%, hsla(219.21787709497207, 100%, 35.09803921568627%, 0) 100%), radial-gradient(at 80.17866141269798% 68.22058624580039%, hsla(241.9672131147541, 100%, 23.92156862745098%, 1) 0%, hsla(241.9672131147541, 100%, 23.92156862745098%, 0) 100%), radial-gradient(at 48.66814495639351% 47.90492349070592%, hsla(219.21787709497207, 100%, 35.09803921568627%, 1) 0%, hsla(219.21787709497207, 100%, 35.09803921568627%, 0) 100%), radial-gradient(at 9.237576199346332% 65.41627506571648%, hsla(241.9672131147541, 100%, 23.92156862745098%, 1) 0%, hsla(241.9672131147541, 100%, 23.92156862745098%, 0) 100%), radial-gradient(at 7.1165208774113475% 89.5297496302607%, hsla(219.21787709497207, 100%, 35.09803921568627%, 1) 0%, hsla(219.21787709497207, 100%, 35.09803921568627%, 0) 100%), radial-gradient(at 75.19639499278834% 65.08267205365021%, hsla(241.9672131147541, 100%, 23.92156862745098%, 1) 0%, hsla(241.9672131147541, 100%, 23.92156862745098%, 0) 100%), radial-gradient(at 60.60505948753201% 31.899020704306125%, hsla(219.21787709497207, 100%, 35.09803921568627%, 1) 0%, hsla(219.21787709497207, 100%, 35.09803921568627%, 0) 100%), radial-gradient(at 95.2895008292364% 11.13339013752408%, hsla(241.9672131147541, 100%, 23.92156862745098%, 1) 0%, hsla(241.9672131147541, 100%, 23.92156862745098%, 0) 100%), radial-gradient(at 95.14351046985506% 49.036773380224915%, hsla(219.21787709497207, 100%, 35.09803921568627%, 1) 0%, hsla(219.21787709497207, 100%, 35.09803921568627%, 0) 100%), radial-gradient(at 74.72059198593612% 92.81927561773404%, hsla(241.9672131147541, 100%, 23.92156862745098%, 1) 0%, hsla(241.9672131147541, 100%, 23.92156862745098%, 0) 100%), radial-gradient(at 83.21611385029983% 10.190692410264157%, hsla(219.21787709497207, 100%, 35.09803921568627%, 1) 0%, hsla(219.21787709497207, 100%, 35.09803921568627%, 0) 100%), radial-gradient(at 34.73292974529307% 3.6566772751892573%, hsla(241.9672131147541, 100%, 23.92156862745098%, 1) 0%, hsla(241.9672131147541, 100%, 23.92156862745098%, 0) 100%)`,
    `radial-gradient(at 9.488796373887176% 78.0619836634001%, hsla(323.73626373626377, 90.09900990099013%, 60.392156862745104%, 1) 0%, hsla(323.73626373626377, 90.09900990099013%, 60.392156862745104%, 0) 100%), radial-gradient(at 41.21931927193037% 40.68703187684145%, hsla(279.2178770949721, 90.86294416243655%, 61.372549019607845%, 1) 0%, hsla(279.2178770949721, 90.86294416243655%, 61.372549019607845%, 0) 100%), radial-gradient(at 84.91906789923802% 82.55723450511073%, hsla(31.86721991701245, 97.57085020242916%, 51.5686274509804%, 1) 0%, hsla(31.86721991701245, 97.57085020242916%, 51.5686274509804%, 0) 100%), radial-gradient(at 7.261533176902346% 93.15418702920093%, hsla(194.0689655172414, 96.02649006622518%, 70.3921568627451%, 1) 0%, hsla(194.0689655172414, 96.02649006622518%, 70.3921568627451%, 0) 100%), radial-gradient(at 29.93046872483671% 5.108960065500822%, hsla(323.73626373626377, 90.09900990099013%, 60.392156862745104%, 1) 0%, hsla(323.73626373626377, 90.09900990099013%, 60.392156862745104%, 0) 100%), radial-gradient(at 90.87601584733964% 69.81026831684231%, hsla(279.2178770949721, 90.86294416243655%, 61.372549019607845%, 1) 0%, hsla(279.2178770949721, 90.86294416243655%, 61.372549019607845%, 0) 100%), radial-gradient(at 48.06082848829216% 32.83930819838551%, hsla(31.86721991701245, 97.57085020242916%, 51.5686274509804%, 1) 0%, hsla(31.86721991701245, 97.57085020242916%, 51.5686274509804%, 0) 100%), radial-gradient(at 22.2862923952733% 94.21886437369025%, hsla(194.0689655172414, 96.02649006622518%, 70.3921568627451%, 1) 0%, hsla(194.0689655172414, 96.02649006622518%, 70.3921568627451%, 0) 100%)`
  ];

  // Profile form states
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    birthDate: "",
    gender: "",
    maritalStatus: "",
    occupation: "",
    primaryPhone: "",
    secondaryPhone: "",
    emergencyContact: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    baptismDate: "",
    joinDate: "",
  });

  const member = user?.member as Member | undefined;

  // Verificar se é aniversário
  const isBirthday = (): boolean => {
    if (!member?.birthDate) return false;
    const today = new Date();
    const birthDate = parseDate(member.birthDate);
    if (!birthDate) return false;
    return getMonth(today) === getMonth(birthDate) && getDate(today) === getDate(birthDate);
  };

  useEffect(() => {
    loadUpcomingSchedules();

    // Mostrar animação de aniversário após 1 segundo
    if (isBirthday()) {
      const timer = setTimeout(() => {
        setShowBirthdayAnimation(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [member]);

  const loadUpcomingSchedules = async () => {
    if (!member) return;

    setIsLoadingSchedules(true);
    try {
      const schedules = await schedulesService.getAll();

      // Filtrar escalas futuras onde o membro está envolvido
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const memberSchedules = schedules
        .filter(schedule => {
          const scheduleDate = new Date(schedule.date);
          scheduleDate.setHours(0, 0, 0, 0);

          if (scheduleDate < today) return false;

          // Verifica se o membro está na escala (como ministro ou pregador)
          if (schedule.type === 'Louvor' && schedule.minister?.name === member.name) return true;
          if (schedule.type === 'Pregação' && schedule.preacher?.name === member.name) return true;

          return false;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3); // Limitar a 3 próximas escalas

      setUpcomingSchedules(memberSchedules);
    } catch (error) {
      console.error("Erro ao carregar escalas:", error);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Parse date string (YYYY-MM-DD) sem timezone issues
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    // Remove parte de tempo se existir e trim
    const dateOnly = dateString.split('T')[0].trim();

    // Parse manual: YYYY-MM-DD
    const parts = dateOnly.split('-');
    if (parts.length !== 3) return null;

    // Validar que cada parte tem o tamanho correto
    if (parts[0].length !== 4 || parts[1].length !== 2 || parts[2].length !== 2) {
      return null;
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Mês começa em 0
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    if (year < 1900 || year > 2100) return null; // Validação de ano razoável
    if (month < 0 || month > 11) return null; // Validação de mês
    if (day < 1 || day > 31) return null; // Validação básica de dia

    return new Date(year, month, day);
  };

  const calculateAge = (birthDate: string | null | undefined): number | null => {
    if (!birthDate) return null;
    try {
      const date = parseDate(birthDate);
      if (!date) return null;
      return differenceInYears(new Date(), date);
    } catch {
      return null;
    }
  };

  const calculateAgeInMonths = (birthDate: string | null | undefined): number | null => {
    if (!birthDate) return null;
    try {
      const date = parseDate(birthDate);
      if (!date) return null;

      const today = new Date();
      const years = differenceInYears(today, date);

      // Se tem 1 ano ou mais, retorna null (usaremos anos)
      if (years >= 1) return null;

      // Calcula meses
      const months = (today.getFullYear() - date.getFullYear()) * 12 + (today.getMonth() - date.getMonth());
      return months;
    } catch {
      return null;
    }
  };

  const formatAge = (birthDate: string | null | undefined): string => {
    const age = calculateAge(birthDate);
    if (age === null) return "";

    if (age === 0) {
      const months = calculateAgeInMonths(birthDate);
      if (months === null || months === 0) return "Recém-nascido";
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    }

    return `${age} ${age === 1 ? 'ano' : 'anos'}`;
  };

  const calculateYearsAsMember = (joinDate: string | null | undefined): number | null => {
    if (!joinDate) return null;
    try {
      const date = parseDate(joinDate);
      if (!date) return null;
      return differenceInYears(new Date(), date);
    } catch {
      return null;
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "—";
    try {
      const date = parseDate(dateString);
      if (!date) return "—";
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "—";
    }
  };

  const formatScheduleDate = (dateString: string): string => {
    try {
      const date = parseDate(dateString);
      if (!date) return "—";
      return format(date, "EEE, dd/MMM", { locale: ptBR });
    } catch {
      return "—";
    }
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const yearsAsMember = calculateYearsAsMember(member?.joinDate);

  const openDatesModal = () => {
    setBaptismDate(member?.baptismDate ? formatDateForInput(member.baptismDate) : "");
    setJoinDate(member?.joinDate ? formatDateForInput(member.joinDate) : "");
    setShowDatesModal(true);
  };

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";

    // Se já está no formato YYYY-MM-DD, retorna direto
    const dateOnly = dateString.split('T')[0];
    const parts = dateOnly.split('-');

    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);

      // Validação básica
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) &&
          year >= 1900 && year <= 2100 &&
          month >= 1 && month <= 12 &&
          day >= 1 && day <= 31) {
        // Formata com zeros à esquerda
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }

    return "";
  };

  const openProfileModal = () => {
    if (!member) return;

    setProfileData({
      name: member.name || "",
      email: member.email || "",
      birthDate: member.birthDate ? formatDateForInput(member.birthDate) : "",
      gender: member.gender || "",
      maritalStatus: member.maritalStatus || "",
      occupation: member.occupation || "",
      primaryPhone: member.primaryPhone || "",
      secondaryPhone: member.secondaryPhone || "",
      emergencyContact: member.emergencyContact || "",
      zipCode: member.zipCode || "",
      street: member.street || "",
      number: member.number || "",
      complement: member.complement || "",
      neighborhood: member.neighborhood || "",
      city: member.city || "",
      state: member.state || "",
      baptismDate: member.baptismDate ? formatDateForInput(member.baptismDate) : "",
      joinDate: member.joinDate ? formatDateForInput(member.joinDate) : "",
    });
    setShowProfileModal(true);
  };

  const handleUpdateDates = async () => {
    if (!member) return;

    setIsSubmitting(true);
    try {
      await membersService.updateMe({
        baptismDate: baptismDate || null,
        joinDate: joinDate || null,
      });

      await refreshUser?.();
      toast.success("Datas atualizadas com sucesso!");
      setShowDatesModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar datas";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!member) return;

    setIsSubmitting(true);
    try {
      await membersService.updateMe({
        name: profileData.name,
        email: profileData.email,
        birthDate: profileData.birthDate || null,
        gender: profileData.gender,
        maritalStatus: profileData.maritalStatus,
        occupation: profileData.occupation,
        primaryPhone: profileData.primaryPhone,
        secondaryPhone: profileData.secondaryPhone || null,
        emergencyContact: profileData.emergencyContact || null,
        zipCode: profileData.zipCode || null,
        street: profileData.street || null,
        number: profileData.number || null,
        complement: profileData.complement || null,
        neighborhood: profileData.neighborhood || null,
        city: profileData.city || null,
        state: profileData.state || null,
        baptismDate: profileData.baptismDate || null,
        joinDate: profileData.joinDate || null,
      });

      await refreshUser?.();
      toast.success("Perfil atualizado com sucesso!");
      setShowProfileModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar perfil";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header with background image */}
      <div className="relative h-48 md:h-64 flex flex-col">
        {/* Background Image */}
        <img
          src={heroRoad}
          alt="Igreja do Deus de Maravilhas"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/70 to-secondary/40" />

        {/* Header Bar */}
        <header className="relative z-10 flex items-center justify-between p-4">
          <img
            src={logoWhite}
            alt="Igreja do Deus de Maravilhas"
            className="w-10 h-10 object-contain"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </header>

        {/* Welcome Message */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-white font-bold text-2xl md:text-3xl mb-1">
            Graça e Paz!
          </h1>
          <h2 className="text-white/90 text-lg md:text-xl">
            Seja bem-vindo(a) à área de membros
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 mt-4 md:-mt-8 px-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Profile Card */}
          <Card className="border-2">
            <CardContent className="pt-6 relative">
              {/* Anos como membro - fixo no topo direito */}
              {yearsAsMember !== null && (
                <div className="absolute top-[10px] right-[10px] text-right max-w-[80px] md:max-w-none">
                  <div className="text-3xl font-bold text-primary">{yearsAsMember}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide leading-tight">
                    {yearsAsMember === 1 ? 'ano' : 'anos'} como membro
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex justify-center md:justify-start">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={member?.photoUrl} alt={member?.name} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {getInitials(member?.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground pr-20 md:pr-24">{member?.name || "Membro"}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {member?.churchRole && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {member.churchRole}
                        </Badge>
                      )}
                      {member?.membershipStatus && (
                        <Badge variant="outline">
                          {member.membershipStatus}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {member?.memberCode && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="h-4 w-4 flex-shrink-0" />
                        <span>Código: <span className="text-primary font-semibold">{member.memberCode}</span></span>
                      </div>
                    )}
                    {member?.church && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Church className="h-4 w-4 flex-shrink-0" />
                        <span>{member.church}</span>
                      </div>
                    )}
                    {member?.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member?.primaryPhone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{member.primaryPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {member?.birthDate && (
                  <div className="flex justify-between items-start py-2 border-b">
                    <Cake className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="text-sm font-medium text-right flex flex-col gap-0.5">
                      <span>{formatDate(member?.birthDate)}</span>
                      {formatAge(member?.birthDate) && (
                        <span className="text-xs text-muted-foreground">
                          {formatAge(member?.birthDate)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {member?.maritalStatus && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Estado Civil</span>
                    <span className="text-sm font-medium">{member.maritalStatus}</span>
                  </div>
                )}
                {member?.occupation && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Profissão</span>
                    <span className="text-sm font-medium">{member.occupation}</span>
                  </div>
                )}
                {/* Data de Batismo - sempre exibir */}
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Data de Batismo</span>
                  {member?.baptismDate ? (
                    <span className="text-sm font-medium">{formatDate(member.baptismDate)}</span>
                  ) : (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-primary text-sm"
                      onClick={openDatesModal}
                    >
                      Atualizar dados
                    </Button>
                  )}
                </div>
                {/* Membro desde - sempre exibir */}
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Membro desde</span>
                  {member?.joinDate ? (
                    <span className="text-sm font-medium">{formatDate(member.joinDate)}</span>
                  ) : (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-primary text-sm"
                      onClick={openDatesModal}
                    >
                      Atualizar dados
                    </Button>
                  )}
                </div>

                {/* Botão Painel Gerencial - Apenas para não-membros */}
                {user?.role && user.role !== 'member' && (
                  <div className="pt-2">
                    <Button
                      variant="default"
                      className="w-full px-4 py-3 md:px-8 md:py-4 gap-2 md:gap-3 text-[0.8rem]"
                      onClick={() => navigate('/dashboard')}
                    >
                      <LayoutDashboard className="h-4 w-4 md:h-5 md:w-5" />
                      Acessar Painel Gerencial
                    </Button>
                  </div>
                )}

                {/* Botão Carteira de Membro */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full px-4 py-3 md:px-8 md:py-4 gap-2 md:gap-3 text-[0.8rem]"
                    onClick={() => setShowMemberCardModal(true)}
                  >
                    <User className="h-4 w-4 md:h-5 md:w-5" />
                    Visualizar Carteira de Membro
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Minhas Escalas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Minhas Próximas Escalas
                </CardTitle>
                <CardDescription>
                  Suas escalas de louvor e pregação
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSchedules ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : upcomingSchedules.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${
                          schedule.type === 'Louvor'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-accent/10 text-accent-foreground'
                        }`}>
                          {schedule.type === 'Louvor' ? (
                            <Music className="h-5 w-5" />
                          ) : (
                            <BookOpen className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {schedule.type === 'Louvor' ? 'Ministração de Louvor' : 'Pregação'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatScheduleDate(schedule.date)} • {schedule.church}
                          </p>
                        </div>
                        <Badge variant="outline" className="flex-shrink-0">
                          {schedule.category}
                        </Badge>
                      </div>
                    ))}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => navigate('/calendar')}
                    >
                      Ver todas as escalas
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Você não tem escalas programadas no momento
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Frequência nos Cultos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Frequência nos Cultos
                </CardTitle>
                <CardDescription>
                  Sua participação este ano
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total de Presenças</span>
                    <span className="font-semibold">32 cultos</span>
                  </div>
                  <Progress value={80} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">80% de frequência</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">Este mês</span>
                    </div>
                    <span className="text-sm font-medium">4/4 cultos</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">Mês anterior</span>
                    </div>
                    <span className="text-sm font-medium">4/5 cultos</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Última presença</span>
                    </div>
                    <span className="text-sm font-medium">Domingo passado</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs text-center text-primary font-medium">
                    🎯 Parabéns! Você é um membro assíduo!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${isBirthday() ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate('/prayer-request')}
                >
                  <Heart className="h-6 w-6 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold">Pedido de Oração</div>
                    <div className="text-xs text-muted-foreground">Envie seu pedido</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate('/calendar')}
                >
                  <CalendarIcon className="h-6 w-6 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold">Calendário</div>
                    <div className="text-xs text-muted-foreground">Eventos e escalas</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={openProfileModal}
                >
                  <Edit className="h-6 w-6 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold">Meus Dados</div>
                    <div className="text-xs text-muted-foreground">Atualizar informações</div>
                  </div>
                </Button>

                {isBirthday() && (
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setShowBirthdayAnimation(true)}
                  >
                    <PartyPopper className="h-6 w-6 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold">Animação</div>
                      <div className="text-xs text-muted-foreground">Ver parabéns</div>
                    </div>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Blessing Message */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm text-center">
              Que Deus abençoe sua vida e sua família
            </span>
            <Heart className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>

      {/* Animação de Aniversário */}
      <BirthdayConfetti
        show={showBirthdayAnimation}
        memberName={member?.name || "Membro"}
        onComplete={() => setShowBirthdayAnimation(false)}
      />

      {/* Modal de Atualização de Datas */}
      <Dialog open={showDatesModal} onOpenChange={setShowDatesModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar Informações</DialogTitle>
            <DialogDescription>
              Atualize suas informações de batismo e entrada na igreja
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="baptismDate">Data de Batismo</Label>
              <DateInput
                id="baptismDate"
                name="baptismDate"
                value={baptismDate}
                onChangeString={(date) => setBaptismDate(date)}
                disabled={isSubmitting}
                placeholder="DD/MM/AAAA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinDate">Membro desde</Label>
              <DateInput
                id="joinDate"
                name="joinDate"
                value={joinDate}
                onChangeString={(date) => setJoinDate(date)}
                disabled={isSubmitting}
                placeholder="DD/MM/AAAA"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDatesModal(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateDates} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Perfil Completo */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meus Dados</DialogTitle>
            <DialogDescription>
              Atualize suas informações pessoais
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <DateInput
                    id="birthDate"
                    name="birthDate"
                    value={profileData.birthDate}
                    onChangeString={(date) => setProfileData({ ...profileData, birthDate: date })}
                    disabled={isSubmitting}
                    placeholder="DD/MM/AAAA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero</Label>
                  <Input
                    id="gender"
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    disabled={isSubmitting}
                    placeholder="Ex: Masculino, Feminino"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Estado Civil</Label>
                  <Input
                    id="maritalStatus"
                    value={profileData.maritalStatus}
                    onChange={(e) => setProfileData({ ...profileData, maritalStatus: e.target.value })}
                    disabled={isSubmitting}
                    placeholder="Ex: Solteiro(a), Casado(a)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Profissão</Label>
                  <Input
                    id="occupation"
                    value={profileData.occupation}
                    onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contatos */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Contatos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryPhone">Telefone Principal *</Label>
                  <Input
                    id="primaryPhone"
                    value={profileData.primaryPhone}
                    onChange={(e) => setProfileData({ ...profileData, primaryPhone: e.target.value })}
                    disabled={isSubmitting}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryPhone">Telefone Secundário</Label>
                  <Input
                    id="secondaryPhone"
                    value={profileData.secondaryPhone}
                    onChange={(e) => setProfileData({ ...profileData, secondaryPhone: e.target.value })}
                    disabled={isSubmitting}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                  <Input
                    id="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                    disabled={isSubmitting}
                    placeholder="Nome e telefone"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={profileData.zipCode}
                    onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
                    disabled={isSubmitting}
                    placeholder="00000-000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={profileData.street}
                    onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={profileData.number}
                    onChange={(e) => setProfileData({ ...profileData, number: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={profileData.complement}
                    onChange={(e) => setProfileData({ ...profileData, complement: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={profileData.neighborhood}
                    onChange={(e) => setProfileData({ ...profileData, neighborhood: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    disabled={isSubmitting}
                    placeholder="Ex: MG, SP"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Informações da Igreja */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Informações da Igreja</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-baptismDate">Data de Batismo</Label>
                  <DateInput
                    id="profile-baptismDate"
                    name="baptismDate"
                    value={profileData.baptismDate}
                    onChangeString={(date) => setProfileData({ ...profileData, baptismDate: date })}
                    disabled={isSubmitting}
                    placeholder="DD/MM/AAAA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-joinDate">Membro desde</Label>
                  <DateInput
                    id="profile-joinDate"
                    name="joinDate"
                    value={profileData.joinDate}
                    onChangeString={(date) => setProfileData({ ...profileData, joinDate: date })}
                    disabled={isSubmitting}
                    placeholder="DD/MM/AAAA"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProfileModal(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateProfile} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Pré-visualização e Customização da Carteira */}
      <Dialog open={showMemberCardModal} onOpenChange={setShowMemberCardModal}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none lg:max-w-5xl lg:max-h-[90vh] lg:w-auto lg:h-auto p-0 overflow-y-auto rounded-none lg:rounded-lg [&>button]:hidden">
          <DialogTitle className="sr-only">Carteirinha de Membro</DialogTitle>
          <div className="relative h-full flex flex-col lg:flex-row">
            {/* Botão fechar */}
            <button
              onClick={() => setShowMemberCardModal(false)}
              className="absolute top-4 right-4 z-50 bg-background hover:bg-accent rounded-full p-2 shadow-lg transition-colors duration-200"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Área de Pré-visualização - Visível apenas no desktop */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 lg:p-8 items-center justify-center">
              <div className="w-full">
                <h3 className="text-xs lg:text-sm font-semibold text-muted-foreground mb-3 lg:mb-4 text-center">
                  Pré-visualização da Carteirinha {showCardBack ? '(Verso)' : '(Frente)'}
                </h3>

                <div className="relative transition-all duration-500 ease-in-out" style={{
                  transformStyle: 'preserve-3d'
                }}>
                  {/* FRENTE DA CARTEIRINHA */}
                  <div
                    className="p-3 lg:p-5 text-white relative rounded-2xl shadow-2xl aspect-[16/10] transition-all duration-500 ease-in-out"
                    style={{
                      background: cardGradients[selectedGradient],
                      overflow: 'hidden',
                      backfaceVisibility: 'hidden',
                      transform: showCardBack ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
              {/* Logo marca d'água de fundo */}
              <div
                className="absolute -right-16 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none z-0"
                style={{
                  width: '200px',
                  height: '200px',
                  backgroundImage: `url(${logoClean})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              />

              {/* Película escura para suavizar o gradiente */}
              <div className="absolute inset-0 bg-black/20 pointer-events-none z-10" />

              {/* Logo e Header */}
              <div className="flex items-center justify-between mb-2 lg:mb-3 relative z-20">
                <div className="flex items-center gap-1.5 lg:gap-2">
                  <img src={logoClean} alt="Logo" className="h-6 w-6 lg:h-8 lg:w-8" />
                  <div>
                    <div className="text-xs lg:text-sm font-semibold opacity-90 leading-tight">Igreja do Deus de Maravilhas</div>
                    <div className="text-[9px] lg:text-xs opacity-75 leading-tight">Comunidade da Redenção em Jesus Cristo</div>
                  </div>
                </div>
              </div>

              {/* Foto e Info Principal */}
              <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3 relative z-20">
                <Avatar className="h-14 w-14 lg:h-16 lg:w-16 border-2 border-white/30 shadow-lg flex-shrink-0">
                  <AvatarImage src={member?.photoUrl} alt={member?.name} />
                  <AvatarFallback className="text-base lg:text-lg bg-white text-primary">
                    {getInitials(member?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] lg:text-[9px] opacity-75 mb-0.5">MEMBRO</div>
                  <h3 className="text-sm lg:text-base font-bold leading-tight mb-0.5 truncate">{member?.name}</h3>
                  <div className="text-[10px] lg:text-xs opacity-90">ID: #{member?.memberCode}</div>
                </div>
              </div>

              {/* Informações */}
              <div className="grid grid-cols-2 gap-x-2 lg:gap-x-3 gap-y-1.5 lg:gap-y-2 mb-2 lg:mb-3 relative z-20">
                <div>
                  <div className="text-[8px] lg:text-[9px] opacity-75 mb-0.5">Data de Nascimento</div>
                  <div className="text-[10px] lg:text-xs font-semibold">{formatDate(member?.birthDate)}</div>
                </div>
                <div>
                  <div className="text-[8px] lg:text-[9px] opacity-75 mb-0.5">Membro desde</div>
                  <div className="text-[10px] lg:text-xs font-semibold">{formatDate(member?.joinDate)}</div>
                </div>
                <div>
                  <div className="text-[8px] lg:text-[9px] opacity-75 mb-0.5">Função</div>
                  <div className="text-[10px] lg:text-xs font-semibold">{member?.churchRole || 'Membro'}</div>
                </div>
                <div>
                  <div className="text-[8px] lg:text-[9px] opacity-75 mb-0.5">Batismo</div>
                  <div className="text-[10px] lg:text-xs font-semibold">{formatDate(member?.baptismDate)}</div>
                </div>
              </div>

              {/* Endereço da Igreja e Validade */}
              <div className="flex items-center justify-between gap-2 lg:gap-3 relative z-20">
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] lg:text-[9px] opacity-75 mb-0.5">Endereço</div>
                  <div className="text-[9px] lg:text-[10px] font-semibold leading-tight">
                    {member?.church === 'Conceição das Alagoas'
                      ? 'R. Santa Rita, 149 - Centro'
                      : 'Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo'
                    }
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[8px] lg:text-[9px] opacity-75">Válido até</div>
                  <div className="text-[10px] lg:text-xs font-semibold">
                    {format(new Date(new Date().getFullYear() + 1, 11, 31), "dd/MM/yyyy")}
                  </div>
                </div>
              </div>
                  </div>

                  {/* VERSO DA CARTEIRINHA */}
                  <div
                    className="absolute top-0 left-0 w-full p-3 lg:p-5 text-white rounded-2xl shadow-2xl aspect-[16/10] transition-all duration-500 ease-in-out"
                    style={{
                      background: cardGradients[selectedGradient],
                      overflow: 'hidden',
                      backfaceVisibility: 'hidden',
                      transform: showCardBack ? 'rotateY(0deg)' : 'rotateY(-180deg)'
                    }}
                  >
                    {/* Logo marca d'água de fundo */}
                    <div
                      className="absolute -left-16 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none z-0"
                      style={{
                        width: '200px',
                        height: '200px',
                        backgroundImage: `url(${logoClean})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                      }}
                    />

                    {/* Película escura para suavizar o gradiente */}
                    <div className="absolute inset-0 bg-black/20 pointer-events-none z-10" />

                    <div className="relative z-20 flex flex-col justify-between h-full">
                      {/* Versículo Bíblico */}
                      <div className="flex items-center justify-center py-1 lg:py-2">
                        <div className="text-center">
                          <p className="text-[10px] lg:text-sm font-serif italic opacity-95 leading-relaxed mb-1">
                            "Nós porém não somos daqueles que se<br />
                            retiram para perdição, mas daqueles que<br />
                            creem para a conservação da alma."
                          </p>
                          <p className="text-[9px] lg:text-xs opacity-75">Hebreus 10:39</p>
                        </div>
                      </div>

                      {/* Informações do verso */}
                      <div className="space-y-1 lg:space-y-1.5">
                        <div className="text-center border-t border-white/20 pt-1.5 lg:pt-2">
                          <p className="text-[7px] lg:text-[9px] opacity-75 mb-0.5 lg:mb-1 leading-tight">Esta carteirinha é de uso pessoal e intransferível</p>
                          <p className="text-[7px] lg:text-[9px] opacity-75 leading-tight">Em caso de perda, comunique à secretaria da igreja</p>
                        </div>

                        <div className="border-t border-white/20 pt-1.5 lg:pt-2 text-center">
                          <h4 className="text-[8px] lg:text-[10px] font-semibold mb-0.5 lg:mb-1 opacity-90">Contatos da Igreja</h4>
                          <div className="space-y-0.5 text-[7px] lg:text-[9px] opacity-75">
                            <p>✉️ Email: idmigreja@gmail.com</p>
                            <p>🌐 Site: www.ideusdemaravilhas.com.br</p>
                          </div>
                        </div>

                        <div className="text-center border-t border-white/20 pt-1.5 lg:pt-2">
                          <p className="text-[7px] lg:text-[8px] opacity-60 leading-tight">
                            Igreja do Deus de Maravilhas<br />
                            Comunidade da Redenção em Jesus Cristo
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs text-muted-foreground mt-4 px-4">
                  Esta carteirinha identifica o portador como membro da Igreja do Deus de Maravilhas
                </div>
              </div>
            </div>

            {/* Painel de Ferramentas de Customização */}
            <div className="w-full lg:w-80 bg-background lg:border-l">
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Customização</h3>
                  <p className="text-xs text-muted-foreground">
                    Personalize sua carteirinha
                  </p>
                </div>

                {/* Pré-visualização Mobile - Visível apenas no mobile */}
                <div className="lg:hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 rounded-lg -mx-6">
                  <div className="w-full">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-3 text-center">
                      Pré-visualização da Carteirinha {showCardBack ? '(Verso)' : '(Frente)'}
                    </h3>
                    {/* A carteirinha aqui - mesma estrutura da desktop */}
                    <div className="relative transition-all duration-500 ease-in-out" style={{transformStyle: 'preserve-3d'}}>
                      {/* FRENTE DA CARTEIRINHA */}
                      <div
                        className="p-3 lg:p-5 text-white relative rounded-2xl shadow-2xl aspect-[16/10] transition-all duration-500 ease-in-out"
                        style={{
                          background: cardGradients[selectedGradient],
                          overflow: 'hidden',
                          backfaceVisibility: 'hidden',
                          transform: showCardBack ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}
                      >
                        {/* Logo marca d'água de fundo */}
                        <div
                          className="absolute -right-16 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none z-0"
                          style={{
                            width: '200px',
                            height: '200px',
                            backgroundImage: `url(${logoClean})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                          }}
                        />

                        {/* Película escura para suavizar o gradiente */}
                        <div className="absolute inset-0 bg-black/20 pointer-events-none z-10" />

                        {/* Logo e Header */}
                        <div className="flex items-center justify-between mb-2 lg:mb-3 relative z-20">
                          <div className="flex items-center gap-1.5 lg:gap-2">
                            <img src={logoClean} alt="Logo" className="h-6 w-6 lg:h-8 lg:w-8" />
                            <div>
                              <div className="text-xs lg:text-sm font-semibold opacity-90 leading-tight">Igreja do Deus de Maravilhas</div>
                              <div className="text-[9px] lg:text-xs opacity-75 leading-tight">Comunidade da Redenção em Jesus Cristo</div>
                            </div>
                          </div>
                        </div>

                        {/* Foto e Info Principal */}
                        <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3 relative z-20">
                          <Avatar className="h-14 w-14 lg:h-16 lg:w-16 border-2 border-white/30 shadow-lg flex-shrink-0">
                            <AvatarImage src={member?.photoUrl} alt={member?.name} />
                            <AvatarFallback className="text-base lg:text-lg bg-white text-primary">
                              {getInitials(member?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-[8px] lg:text-[9px] opacity-75 mb-0.5">MEMBRO</div>
                            <h3 className="text-sm lg:text-base font-bold leading-tight mb-0.5 truncate">{member?.name}</h3>
                            <div className="text-[10px] lg:text-xs opacity-90">ID: #{member?.memberCode}</div>
                          </div>
                        </div>

                        {/* Informações */}
                        <div className="grid grid-cols-2 gap-x-2 lg:gap-x-3 gap-y-1.5 lg:gap-y-2 mb-2 lg:mb-3 relative z-20">
                          <div>
                            <div className="text-[8px] lg:text-[9px] opacity-75 mb-0.5">Data de Nascimento</div>
                            <div className="text-[10px] lg:text-xs font-semibold">{formatDate(member?.birthDate)}</div>
                          </div>
                          <div>
                            <div className="text-[8px] lg:text-[9px] opacity-75 mb-0.5">Membro desde</div>
                            <div className="text-[10px] lg:text-xs font-semibold">{formatDate(member?.joinDate)}</div>
                          </div>
                          <div>
                            <div className="text-[8px] lg:text-[9px] opacity-75 mb-0.5">Função</div>
                            <div className="text-[10px] lg:text-xs font-semibold">{member?.churchRole || 'Membro'}</div>
                          </div>
                          <div>
                            <div className="text-[8px] lg:text-[9px] opacity-75 mb-0.5">Batismo</div>
                            <div className="text-[10px] lg:text-xs font-semibold">{formatDate(member?.baptismDate)}</div>
                          </div>
                        </div>

                        {/* Endereço da Igreja e Validade */}
                        <div className="flex items-center justify-between gap-2 lg:gap-3 relative z-20">
                          <div className="flex-1 min-w-0">
                            <div className="text-[8px] lg:text-[9px] opacity-75 mb-0.5">Endereço</div>
                            <div className="text-[9px] lg:text-[10px] font-semibold leading-tight">
                              {member?.church === 'Conceição das Alagoas'
                                ? 'R. Santa Rita, 149 - Centro'
                                : 'Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo'
                              }
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-[8px] lg:text-[9px] opacity-75">Válido até</div>
                            <div className="text-[10px] lg:text-xs font-semibold">
                              {format(new Date(new Date().getFullYear() + 1, 11, 31), "dd/MM/yyyy")}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* VERSO DA CARTEIRINHA */}
                      <div
                        className="absolute top-0 left-0 w-full p-3 lg:p-5 text-white rounded-2xl shadow-2xl aspect-[16/10] transition-all duration-500 ease-in-out"
                        style={{
                          background: cardGradients[selectedGradient],
                          overflow: 'hidden',
                          backfaceVisibility: 'hidden',
                          transform: showCardBack ? 'rotateY(0deg)' : 'rotateY(-180deg)'
                        }}
                      >
                        {/* Logo marca d'água de fundo */}
                        <div
                          className="absolute -left-16 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none z-0"
                          style={{
                            width: '200px',
                            height: '200px',
                            backgroundImage: `url(${logoClean})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                          }}
                        />

                        {/* Película escura para suavizar o gradiente */}
                        <div className="absolute inset-0 bg-black/20 pointer-events-none z-10" />

                        <div className="relative z-20 flex flex-col justify-between h-full">
                          {/* Versículo Bíblico */}
                          <div className="flex items-center justify-center py-1 lg:py-2">
                            <div className="text-center">
                              <p className="text-[10px] lg:text-sm font-serif italic opacity-95 leading-relaxed mb-1">
                                "Nós porém não somos daqueles que se<br />
                                retiram para perdição, mas daqueles que<br />
                                creem para a conservação da alma."
                              </p>
                              <p className="text-[9px] lg:text-xs opacity-75">Hebreus 10:39</p>
                            </div>
                          </div>

                          {/* Informações do verso */}
                          <div className="space-y-1 lg:space-y-1.5">
                            <div className="text-center border-t border-white/20 pt-1.5 lg:pt-2">
                              <p className="text-[7px] lg:text-[9px] opacity-75 mb-0.5 lg:mb-1 leading-tight">Esta carteirinha é de uso pessoal e intransferível</p>
                              <p className="text-[7px] lg:text-[9px] opacity-75 leading-tight">Em caso de perda, comunique à secretaria da igreja</p>
                            </div>

                            <div className="border-t border-white/20 pt-1.5 lg:pt-2 text-center">
                              <h4 className="text-[8px] lg:text-[10px] font-semibold mb-0.5 lg:mb-1 opacity-90">Contatos da Igreja</h4>
                              <div className="space-y-0.5 text-[7px] lg:text-[9px] opacity-75">
                                <p>✉️ Email: idmigreja@gmail.com</p>
                                <p>🌐 Site: www.ideusdemaravilhas.com.br</p>
                              </div>
                            </div>

                            <div className="text-center border-t border-white/20 pt-1.5 lg:pt-2">
                              <p className="text-[7px] lg:text-[8px] opacity-60 leading-tight">
                                Igreja do Deus de Maravilhas<br />
                                Comunidade da Redenção em Jesus Cristo
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="lg:hidden" />

                {/* Alternador Frente/Verso */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold mb-1">Visualização</h4>
                    <p className="text-xs text-muted-foreground">Escolha qual lado visualizar</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                    <Button
                      variant={!showCardBack ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowCardBack(false)}
                      className="min-w-[70px]"
                    >
                      Frente
                    </Button>
                    <Button
                      variant={showCardBack ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowCardBack(true)}
                      className="min-w-[70px]"
                    >
                      Verso
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Seletor de Modelos */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Modelo de Fundo</h4>
                    <p className="text-xs text-muted-foreground">Escolha o gradiente da sua carteirinha</p>
                  </div>

                  <div className="grid grid-cols-4 gap-2 lg:gap-3">
                    {cardGradients.map((gradient, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedGradient(index)}
                        className={`h-12 lg:h-auto lg:aspect-square rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedGradient === index
                            ? 'ring-2 ring-primary ring-offset-2 scale-105'
                            : 'hover:scale-105 opacity-70 hover:opacity-100'
                        }`}
                        style={{
                          background: gradient
                        }}
                        title={`Modelo ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Botão de Impressão */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Ações</h4>
                    <p className="text-xs text-muted-foreground">Imprimir sua carteirinha</p>
                  </div>

                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="w-full"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Carteirinha
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Versão para Impressão - Oculta na tela, visível na impressão */}
          <style>{`
            @media print {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;

              html, body {
                width: 100%;
                height: 100vh;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
              }

              /* Esconde todo o conteúdo da página normal */
              #root > *:not(:has(.print-area)) {
                display: none !important;
              }

              /* Para o container que tem a print-area, mostra mas esconde filhos */
              #root > *:has(.print-area) > *:not(.print-area) {
                display: none !important;
              }

              /* Mostra apenas a print-area */
              .print-area {
                display: flex !important;
                visibility: visible !important;
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                align-items: center !important;
                justify-content: center !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                z-index: 99999 !important;
                background: white !important;
              }

              .print-cards,
              .print-cards > * {
                page-break-inside: avoid !important;
              }

              @page {
                size: A4 landscape;
                margin: 15mm;
              }
            }

            @media screen {
              .print-area {
                display: none !important;
              }
            }
          `}</style>

          <div className="print-area">
            <div className="print-cards flex gap-0 items-center justify-center">
              {/* FRENTE para impressão */}
              <div
                className="p-4 text-white relative rounded-2xl aspect-[16/10]"
                style={{
                  background: cardGradients[selectedGradient],
                  overflow: 'hidden',
                  width: '360px',
                  pageBreakInside: 'avoid'
                }}
              >
                {/* Logo marca d'água de fundo */}
                <div
                  className="absolute -right-16 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none z-0"
                  style={{
                    width: '200px',
                    height: '200px',
                    backgroundImage: `url(${logoClean})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                />

                {/* Película escura para suavizar o gradiente */}
                <div className="absolute inset-0 bg-black/20 pointer-events-none z-10" />

                {/* Logo e Header */}
                <div className="flex items-center justify-between mb-1.5 relative z-20">
                  <div className="flex items-center gap-1.5">
                    <img src={logoClean} alt="Logo" className="h-6 w-6" />
                    <div>
                      <div className="text-xs font-semibold opacity-90 leading-tight">Igreja do Deus de Maravilhas</div>
                      <div className="text-[10px] opacity-75 leading-tight">Comunidade da Redenção em Jesus Cristo</div>
                    </div>
                  </div>
                </div>

                {/* Foto e Info Principal */}
                <div className="flex items-center gap-2.5 mb-1.5 relative z-20">
                  <Avatar className="h-14 w-14 border-2 border-white/30 shadow-lg flex-shrink-0">
                    <AvatarImage src={member?.photoUrl} alt={member?.name} />
                    <AvatarFallback className="text-base bg-white text-primary">
                      {getInitials(member?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-[8px] opacity-75 mb-0.5">MEMBRO</div>
                    <h3 className="text-sm font-bold leading-tight mb-0.5 truncate">{member?.name}</h3>
                    <div className="text-[10px] opacity-90">ID: #{member?.memberCode}</div>
                  </div>
                </div>

                {/* Informações */}
                <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 mb-1.5 relative z-20">
                  <div>
                    <div className="text-[8px] opacity-75 mb-0.5">Data de Nascimento</div>
                    <div className="text-[10px] font-semibold">{formatDate(member?.birthDate)}</div>
                  </div>
                  <div>
                    <div className="text-[8px] opacity-75 mb-0.5">Membro desde</div>
                    <div className="text-[10px] font-semibold">{formatDate(member?.joinDate)}</div>
                  </div>
                  <div>
                    <div className="text-[8px] opacity-75 mb-0.5">Função</div>
                    <div className="text-[10px] font-semibold">{member?.churchRole || 'Membro'}</div>
                  </div>
                  <div>
                    <div className="text-[8px] opacity-75 mb-0.5">Batismo</div>
                    <div className="text-[10px] font-semibold">{formatDate(member?.baptismDate)}</div>
                  </div>
                </div>

                {/* Endereço da Igreja e Validade */}
                <div className="flex items-center justify-between gap-2.5 relative z-20">
                  <div className="flex-1 min-w-0">
                    <div className="text-[8px] opacity-75 mb-0.5">Endereço</div>
                    <div className="text-[9px] font-semibold leading-tight">
                      {member?.church === 'Conceição das Alagoas'
                        ? 'R. Santa Rita, 149 - Centro'
                        : 'Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo'
                      }
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[8px] opacity-75">Válido até</div>
                    <div className="text-[10px] font-semibold">
                      {format(new Date(new Date().getFullYear() + 1, 11, 31), "dd/MM/yyyy")}
                    </div>
                  </div>
                </div>
              </div>

              {/* VERSO para impressão */}
              <div
                className="p-4 text-white relative rounded-2xl aspect-[16/10]"
                style={{
                  background: cardGradients[selectedGradient],
                  overflow: 'hidden',
                  width: '360px',
                  pageBreakInside: 'avoid'
                }}
              >
                {/* Logo marca d'água de fundo */}
                <div
                  className="absolute -left-16 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none z-0"
                  style={{
                    width: '200px',
                    height: '200px',
                    backgroundImage: `url(${logoClean})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                />

                {/* Película escura para suavizar o gradiente */}
                <div className="absolute inset-0 bg-black/20 pointer-events-none z-10" />

                <div className="relative z-20 flex flex-col justify-between h-full">
                  {/* Versículo Bíblico */}
                  <div className="flex items-center justify-center py-1">
                    <div className="text-center">
                      <p className="text-sm font-serif italic opacity-95 leading-snug mb-1">
                        "Nós porém não somos daqueles que se<br />
                        retiram para perdição, mas daqueles que<br />
                        creem para a conservação da alma."
                      </p>
                      <p className="text-xs opacity-75">Hebreus 10:39</p>
                    </div>
                  </div>

                  {/* Informações do verso */}
                  <div className="space-y-1">
                    <div className="text-center border-t border-white/20 pt-1.5">
                      <p className="text-[9px] opacity-75 mb-0.5 leading-tight">Esta carteirinha é de uso pessoal e intransferível</p>
                      <p className="text-[9px] opacity-75 leading-tight">Em caso de perda, comunique à secretaria da igreja</p>
                    </div>

                    <div className="border-t border-white/20 pt-1.5 text-center">
                      <h4 className="text-[10px] font-semibold mb-0.5 opacity-90">Contatos da Igreja</h4>
                      <div className="space-y-0.5 text-[9px] opacity-75">
                        <p>✉️ Email: idmigreja@gmail.com</p>
                        <p>🌐 Site: www.ideusdemaravilhas.com.br</p>
                      </div>
                    </div>

                    <div className="text-center border-t border-white/20 pt-1.5">
                      <p className="text-[8px] opacity-60 leading-tight">
                        Igreja do Deus de Maravilhas<br />
                        Comunidade da Redenção em Jesus Cristo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberHome;
