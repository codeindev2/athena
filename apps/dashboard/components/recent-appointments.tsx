import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTime } from "@/utils/format-hour";

type Appointments = {
  id: string;
  name: string;
  email: string;
  date: string;
  hour: string;
};
type RecentAppoitmentsProps = {
  appointments: Appointments[];
};
// funcao para pegar iniciais do nome e sobrenome e retornar como avatar
function generateFallback(name: string) {
  if (!name) return "";
  const [firstName, lastName] = name.split(" ");
  if (!lastName) return `${firstName[0]}`;
  return `${firstName[0]}${lastName[0]}`;
}

export function RecentAppoitments({ appointments }: RecentAppoitmentsProps) {
  return (
    <div className="space-y-8">
      {appointments?.map((appointment) => (
        <>
          <div key={appointment.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/01.png" alt="Avatar" />
              <AvatarFallback>
                {generateFallback(appointment?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {appointment.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {appointment.email}
              </p>
            </div>
            <div className="ml-auto font-medium">
              {appointment.date} - {formatTime(appointment.hour)}
            </div>
          </div>
        </>
      ))}
    </div>
  );
}
