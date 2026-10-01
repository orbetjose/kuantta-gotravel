export default function Home() {
  return (
    <div className="bg-body bg-center bg-cover">
      <main className="pt-30 pb-10 md:h-screen">
        <div className="mx-auto flex md:flex-row flex-col h-full max-w-7xl 3xl:max-w-8xl items-center gap-8 md:gap-16 px-6 lg:px-8">
          {/* Contenedor izquierdo */}
          <section className="flex md:w-1/2 flex-col justify-center gap-6">
            <div className="flex flex-col justify-center gap-2 font-inter">
              <h1 className="text-[clamp(1.8rem,3.6vw,3rem)] leading-tight tracking-tight text-white font-bold">
                ¿Cuánto vendiste hoy?
              </h1>
              <h2 className="text-[clamp(1.8rem,3.6vw,3rem)] leading-tight tracking-tight text-primary-green font-bold">
                ¿Cuánto te deben?
              </h2>
              <h2 className="text-[clamp(1.8rem,3.6vw,3rem)] leading-tight tracking-tight text-white font-bold">
                ¿Cuánto facturaste?
              </h2>
            </div>

            <p className="text-white md:text-xl font-inter">
              Kuantta centraliza ventas, cartera y facturación de tu agencia en
              una sola plataforma.
            </p>
            <div className="flex gap-4 font-inter font-bold">
              <a
                href="/login"
                className="rounded-xl bg-primary-green px-3 py-1.5 text-white transition hover:bg-primary-blue"
              >
                Solicitar demo
              </a>
              <a
                href=""
                className="rounded-xl px-3 py-1.5 border border-primary-green text-white"
              >
                Ver como funciona
              </a>
            </div>
            <div className="font-inter font-bold">
              <ul className="flex gap-4 text-white text-sm list-disc list-inside marker:text-primary-green">
                <li>Sin tarjeta de crédito</li>
                <li>Configuración en minutos</li>
                <li>100% en la nube</li>
              </ul>
            </div>
            <div className="flex gap-4">
              <a href="">
                <img
                  src="/assets/images/fb.png"
                  className="h-7"
                  alt="Logo facebook kuantta"
                />
              </a>
              <a href="">
                <img
                  src="/assets/images/twitter.png"
                  className="h-7"
                  alt="Logo x kuantta"
                />
              </a>
              <a href="">
                <img
                  src="/assets/images/instagram.png"
                  className="h-7"
                  alt="Logo instagram kuantta"
                />
              </a>
              <a href="">
                <img
                  src="/assets/images/tiktok.png"
                  className="h-7"
                  alt="Logo tiktok kuantta"
                />
              </a>
            </div>
          </section>

          {/* Contenedor derecho */}
          <section className=" flex flex-col gap-4 md:w-1/2">
            <div className="flex gap-4">
              {/* Imagen 1 */}
              <div className="md:max-h-40 3xl:max-h-50 overflow-hidden rounded-xl">
                <img
                  src="/assets/images/grafica-1.png"
                  alt="Servicios vendidos"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Imagen 2 */}
              <div className="md:max-h-40 3xl:max-h-50 overflow-hidden rounded-xl">
                <img
                  src="/assets/images/grafica-2.png"
                  alt="Ventas por asesor"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Imagen 3 */}
              <div className="md:max-h-40 3xl:max-h-50 overflow-hidden rounded-xl">
                <img
                  src="/assets/images/grafica-3.png"
                  alt="Ventas por cliente"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="flex md:flex-row flex-col gap-4">
              {/* Imagen 4 - ocupa dos columnas */}
              <div className="col-span-2 min-h-0 overflow-hidden rounded-xl md:w-4/5">
                <img
                  src="/assets/images/grafica-4.png"
                  alt="Ventas por periodo"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Columna derecha */}
              <div className="flex md:grid min-h-0 md:grid-rows-2 gap-3 md:w-2/5">
                {/* Imagen 5 */}
                <div className="min-h-0 overflow-hidden rounded-xl">
                  <img
                    src="/assets/images/grafica-5.png"
                    alt="Utilidad"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Imagen 6 */}
                <div className="min-h-0 overflow-hidden rounded-xl">
                  <img
                    src="/assets/images/grafica-6.png"
                    alt="Cartera"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
