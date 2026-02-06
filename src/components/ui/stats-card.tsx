interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  borderColor: string;
  bgColor: string;
  error?: boolean;
}

export const StatCard = ({ title, value, icon, borderColor, bgColor, error }: StatCardProps) => {
  return (
    <div
      className="flex justify-between items-center rounded-md bg-white p-6 w-full"
      style={{ border: `2px solid ${borderColor}`, backgroundColor: bgColor }}
    >
      <div>
        <h4 className="text-sm md:text-base lg:text-sm xl:text-lg leading-tight mb-2">
          {error ? <span className="text-red-600 text-sm">Err</span> : value}
        </h4>
        <p className="text-xs md:text-sm lg:text-xs xl:text-base text-gray-600">{title}</p>
      </div>
      <div>
        <img src={icon} alt={title} />
      </div>
    </div>
  );
};

interface StatsCardsProps {
  stats: {
    id: number | string;
    title: string;
    value: string | number;
    icon: string;
    borderColor: string;
    bgColor: string;
  }[];
  error?: boolean;
}

export const StatsCards = ({ stats, error }: StatsCardsProps) => {
  return (
    <div className="my-10 mx-8 flex flex-col md:flex-row justify-between gap-6 items-center">
      {stats.map(stat => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          borderColor={stat.borderColor}
          bgColor={stat.bgColor}
          error={error}
        />
      ))}
    </div>
  );
};
