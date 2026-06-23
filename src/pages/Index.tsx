import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const HERO_IMG =
  'https://cdn.poehali.dev/projects/820bb95d-41a2-4aa1-9e90-84e9a4ba7133/files/041dad0b-8433-42d8-8283-187f5fecd807.jpg';

const WEDDING_DATE = new Date('2026-08-07T16:00:00');

const nav = [
  { id: 'about', label: 'О событии' },
  { id: 'when', label: 'Дата и место' },
  { id: 'gallery', label: 'Галерея' },
  { id: 'rsvp', label: 'Подтверждение' },
  { id: 'contacts', label: 'Контакты' },
];

function useCountdown(target: Date) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [target]);
  return t;
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setShown(true),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={shown ? 'animate-reveal' : 'opacity-0'}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const RSVP_URL = 'https://functions.poehali.dev/2cb485d3-6590-4f1d-9261-793886b00eb3';

const Index = () => {
  const { toast } = useToast();
  const cd = useCountdown(WEDDING_DATE);
  const [form, setForm] = useState({ name: '', attend: 'yes', guests: '1', wishes: '' });
  const [loading, setLoading] = useState(false);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(RSVP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      toast({
        title: 'Спасибо!',
        description: 'Ваш ответ принят. Мы будем рады видеть вас на празднике.',
      });
      setForm({ name: '', attend: 'yes', guests: '1', wishes: '' });
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить ответ. Попробуйте ещё раз.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-xl tracking-widest">М <span className="text-accent">&</span> Е</span>
          <nav className="hidden md:flex gap-8 text-sm tracking-wide">
            {nav.map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="hover:text-accent transition-colors">
                {n.label}
              </button>
            ))}
          </nav>
          <Button size="sm" onClick={() => scrollTo('rsvp')} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-none">
            Подтвердить
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <p className="animate-reveal text-accent tracking-[0.4em] text-sm uppercase mb-6">Мы женимся</p>
            <h1 className="animate-reveal font-display text-7xl md:text-9xl leading-[0.9]" style={{ animationDelay: '120ms' }}>
              Максим
              <span className="block text-accent italic">&amp;</span>
              Екатерина
            </h1>
            <div className="animate-line h-px bg-foreground/30 my-8 max-w-xs" style={{ animationDelay: '500ms' }} />
            <p className="animate-reveal text-lg md:text-xl text-muted-foreground max-w-md" style={{ animationDelay: '600ms' }}>
              7 августа 2026 · Шахунья. Приглашаем вас разделить с нами самый важный день нашей жизни.
            </p>
            <div className="animate-reveal mt-10 flex flex-wrap gap-4" style={{ animationDelay: '750ms' }}>
              <Button onClick={() => scrollTo('rsvp')} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-none px-8 h-12">
                Подтвердить присутствие
              </Button>
              <Button variant="outline" onClick={() => scrollTo('when')} className="rounded-none px-8 h-12 border-foreground/30">
                Детали
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float text-muted-foreground">
          <Icon name="ChevronDown" size={28} />
        </div>
      </section>

      {/* COUNTDOWN */}
      <section className="bg-foreground text-background py-16">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <p className="text-center tracking-[0.3em] uppercase text-sm text-background/60 mb-10">До торжества осталось</p>
          </Reveal>
          <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
            {[
              { v: cd.d, l: 'дней' },
              { v: cd.h, l: 'часов' },
              { v: cd.m, l: 'минут' },
              { v: cd.s, l: 'секунд' },
            ].map((it, i) => (
              <Reveal key={it.l} delay={i * 100}>
                <div className="text-center">
                  <div className="font-display text-5xl md:text-7xl text-accent tabular-nums">
                    {String(it.v).padStart(2, '0')}
                  </div>
                  <div className="mt-2 text-xs md:text-sm tracking-widest uppercase text-background/50">{it.l}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-28">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div>
              <p className="text-accent tracking-[0.3em] uppercase text-sm mb-4">О событии</p>
              <h2 className="font-display text-5xl md:text-6xl mb-8 leading-tight">
                Наша история начинается с вас
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Пять лет назад мы встретились случайно, а сегодня готовы сказать друг другу
                «да». Этот день станет особенным, и мы хотим, чтобы рядом были самые
                близкие люди.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Будет тёплый вечер, живая музыка, хорошее вино и много искренних эмоций.
                Приходите праздновать вместе с нами.
              </p>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: 'Heart', t: '5 лет', s: 'вместе' },
                { icon: 'Users', t: '80', s: 'гостей' },
                { icon: 'Sparkles', t: '1', s: 'вечер' },
              ].map((c) => (
                <div key={c.s} className="border border-border p-6 text-center bg-card hover:border-accent transition-colors">
                  <Icon name={c.icon} size={28} className="mx-auto text-accent mb-4" />
                  <div className="font-display text-3xl">{c.t}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide">{c.s}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHEN & WHERE */}
      <section id="when" className="py-28 bg-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-accent tracking-[0.3em] uppercase text-sm mb-4">Дата и место</p>
              <h2 className="font-display text-5xl md:text-6xl">Когда и где</h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: 'Heart', t: 'Роспись', s: 'г. Шахунья, ул. Чапаева, д. 1', d: 'Торжественная церемония бракосочетания. Сбор гостей в 15:30, начало в 16:00.', maps: 'https://yandex.ru/maps/?text=Шахунья+ул.+Чапаева+1' },
              { icon: 'Sparkles', t: 'Праздничный вечер', s: 'г. Шахунья, ул. Советская, д. 13', d: 'Праздничный банкет, живая музыка и танцы. Начало после церемонии.', maps: 'https://yandex.ru/maps/?text=Шахунья+ул.+Советская+13' },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 150}>
                <div className="bg-card border border-border p-10 h-full flex flex-col">
                  <Icon name={c.icon} size={36} className="text-accent mb-6" />
                  <h3 className="font-display text-3xl mb-2">{c.t}</h3>
                  <p className="text-accent font-medium mb-4">{c.s}</p>
                  <p className="text-muted-foreground leading-relaxed mb-6">{c.d}</p>
                  <a
                    href={c.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-2 border border-foreground/20 px-4 h-10 text-sm hover:border-accent hover:text-accent transition-colors w-fit"
                  >
                    <Icon name="Navigation" size={16} />
                    Маршрут
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-accent tracking-[0.3em] uppercase text-sm mb-4">Галерея</p>
              <h2 className="font-display text-5xl md:text-6xl">Моменты вместе</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[260px]">
            {['col-span-2 row-span-2', '', '', 'col-span-2', '', ''].map((cls, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className={`group relative overflow-hidden h-full ${cls}`}>
                  <img
                    src={HERO_IMG}
                    alt=""
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RSVP */}
      <section id="rsvp" className="py-28 bg-foreground text-background">
        <div className="max-w-2xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-accent tracking-[0.3em] uppercase text-sm mb-4">Подтверждение</p>
              <h2 className="font-display text-5xl md:text-6xl mb-4">Будете с нами?</h2>
              <p className="text-background/60">Пожалуйста, ответьте до 25 июля 2026 года</p>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="block text-sm tracking-wide uppercase mb-2 text-background/60">Ваше имя</label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Иван и Мария Ивановы"
                  className="rounded-none bg-background/5 border-background/20 text-background placeholder:text-background/30 h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm tracking-wide uppercase mb-2 text-background/60">Присутствие</label>
                  <div className="flex gap-2">
                    {[
                      { v: 'yes', l: 'Приду' },
                      { v: 'no', l: 'Не смогу' },
                    ].map((o) => (
                      <button
                        type="button"
                        key={o.v}
                        onClick={() => setForm({ ...form, attend: o.v })}
                        className={`flex-1 h-12 border text-sm transition-colors ${
                          form.attend === o.v
                            ? 'bg-accent border-accent text-accent-foreground'
                            : 'border-background/20 text-background/70 hover:border-accent'
                        }`}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm tracking-wide uppercase mb-2 text-background/60">Гостей</label>
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    value={form.guests}
                    onChange={(e) => setForm({ ...form, guests: e.target.value })}
                    className="rounded-none bg-background/5 border-background/20 text-background h-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm tracking-wide uppercase mb-2 text-background/60">Пожелания</label>
                <Textarea
                  value={form.wishes}
                  onChange={(e) => setForm({ ...form, wishes: e.target.value })}
                  placeholder="Предпочтения по меню, аллергии, добрые слова..."
                  className="rounded-none bg-background/5 border-background/20 text-background placeholder:text-background/30 min-h-[100px]"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground rounded-none text-base tracking-wide disabled:opacity-60">
                {loading ? 'Отправляем...' : 'Отправить ответ'}
              </Button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* CONTACTS / FOOTER */}
      <section id="contacts" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-accent tracking-[0.3em] uppercase text-sm mb-4">Контакты</p>
              <h2 className="font-display text-5xl md:text-6xl">Остались вопросы?</h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: 'Phone', t: 'Максим', s: '+7 930 804-28-77' },
              { icon: 'Phone', t: 'Екатерина', s: '+7 900 527-36-04' },
              { icon: 'Mail', t: 'Почта', s: 'wedding@maxim-katya.ru' },
            ].map((c, i) => (
              <Reveal key={c.s} delay={i * 100}>
                <div className="p-6">
                  <Icon name={c.icon} size={28} className="mx-auto text-accent mb-4" />
                  <div className="font-display text-2xl">{c.t}</div>
                  <div className="text-muted-foreground">{c.s}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-20 pt-10 border-t border-border text-center">
            <p className="font-display text-3xl tracking-widest">М <span className="text-accent">&</span> Е</p>
            <p className="text-muted-foreground text-sm mt-3">07 · 08 · 2026 — С любовью ждём вас</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;