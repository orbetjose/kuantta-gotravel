export default function KuanttaDesk() {
  const LOGOS = [
    "/assets/images/amadeus_logo.png",
    "/assets/images/kontrol_travel.png",
    "/assets/images/google_drive.png",
    "/assets/images/siigo_logo.png",
    "/assets/images/bancolombia_logo.png",
    "/assets/images/avianca_logo.png",
    "/assets/images/banco_republica.png",
  ];

  return (
    <div className="w-full rounded-lg bg-fourth-gray p-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {LOGOS.map((logo, index) => (
          <div className="bg-white rounded-lg py-4 px-4 " key={index}>
            <img className="h-14 object-contain mx-auto" src={logo} alt="" />
          </div>
        ))}
      </div>
    </div>
  );
}
