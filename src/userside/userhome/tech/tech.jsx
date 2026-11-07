// ── asset imports ─────────────────────────────────────────────────────────────
const ai        = '/assets/ai.webp';
const ps        = '/assets/ps.webp';
const id        = '/assets/id.webp';
const figma     = '/assets/figma.webp';
const xd        = '/assets/xd.webp';

const acd       = '/assets/Autocad.webp';
const blender   = '/assets/Blender.webp';
const maya      = '/assets/maya.webp';
const revit     = '/assets/Revit.webp';
const sketchup  = '/assets/Sketchup.webp';

const react     = '/assets/re.webp';
const vue       = '/assets/vue.webp';
const angular   = '/assets/angular.webp';
const tailwind  = '/assets/tailwind.webp';
const bootstrap = '/assets/bootstrap.webp';
const js        = '/assets/js.webp';

const node      = '/assets/node.webp';
const php       = '/assets/php.webp';
const laravel   = '/assets/laravel.webp';
const ruby      = '/assets/rubi.webp';
const net       = '/assets/net.webp';
const codeigniter = '/assets/agun.webp';

const flutter   = '/assets/flutter.webp';
const java      = '/assets/java.webp';
const kotlin    = '/assets/kotlin.webp';
const swift     = '/assets/swift.webp';


// ── data ─────────────────────────────────────────────────────────────────────
const sections = [
  {
    num: '01',
    title: 'Graphic Design',
    items: [
      { src: ai, label: 'Illustrator' },
      { src: ps, label: 'Photoshop' },
      { src: id, label: 'InDesign' },
    ],
  },
  {
    num: '02',
    title: 'UI/UX Design',
    items: [
      { src: figma, label: 'Figma' },
      { src: xd, label: 'Adobe XD' },
    ],
  },
  {
    num: '03',
    title: '3D / CAD / BIM',
    items: [
      { src: acd, label: 'AutoCAD' },
      { src: blender, label: 'Blender' },
      { src: sketchup, label: 'SketchUp' },
      { src: maya, label: 'Maya' },
      { src: revit, label: 'Revit' },
    ],
  },
  {
    num: '04',
    title: 'Web Frontend',
    items: [
      { src: react, label: 'React' },
      { src: vue, label: 'Vue.js' },
      { src: angular, label: 'Angular' },
      { src: tailwind, label: 'Tailwind CSS' },
      { src: bootstrap, label: 'Bootstrap' },
      { src: js, label: 'JavaScript' },
    ],
  },

  {
    num: '05',
    title: 'Web Backend',
    items: [
      { src: node, label: 'Node.js' },
      { src: php, label: 'PHP' },
      { src: laravel, label: 'Laravel' },
      { src: ruby, label: 'Ruby on Rails' },
      { src: net, label: 'ASP.NET / .NET' },
      { src: codeigniter, label: 'CodeIgniter' },
    ],
  },
  {
    num: '06',
    title: 'App Development',
    items: [
      { src: react, label: 'React Native' },
      { src: flutter, label: 'Flutter' },
      { src: java, label: 'Java' },
      { src: kotlin, label: 'Kotlin' },
      { src: swift, label: 'Swift' },
    ],
  },
];


const Tech = () => {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">

      <div className="text-center mb-16">
        <p className="text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4">
          Our Stack
        </p>

        <h2
          className="font-serif text-4xl md:text-5xl font-semibold text-gray-900 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Technologies <em className="italic text-blue-500">We Use</em>
        </h2>
      </div>

      <div className="flex flex-col gap-3 max-w-7xl mx-auto">
        {sections.map((section) => (
          <div
            key={section.title}
            className=" lg:px-7 lg:py-5 flex flex-col md:flex-row md:items-center gap-5 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
          >

            <div className="md:w-40 flex-shrink-0">
              <p className="text-xs text-gray-300 font-light mb-0.5">
                {section.num}
              </p>
              <p className="text-sm font-medium text-gray-700">
                {section.title}
              </p>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-10 bg-gray-100 flex-shrink-0" />

            {/* Tech pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 w-full md:w-auto">
              {section.items.map((item, i) => (
                <div key={i}
                  className="flex items-center w-full min-w-0 md:w-auto md:min-w-[8rem] lg:min-w-[10rem] gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-default">
                  <img src={item.src} alt={item.label}
                    className="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0" />
                  <span className="min-w-0 text-xs font-medium leading-tight text-gray-600 md:whitespace-nowrap group-hover:text-gray-700">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </section>
  );
};

export default Tech;