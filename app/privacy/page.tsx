import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — Friday Education',
  description: 'Политика конфиденциальности приложения Friday Education LMS',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-300 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-white text-2xl font-bold mb-1">Политика конфиденциальности</h1>
          <p className="text-slate-500 text-sm">
            Приложение «Friday Education» (LMS учебного центра) · версия от 10 сентября 2026 г.
          </p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-white text-base font-semibold mb-2">1. Общие положения</h2>
            <p>
              Настоящая политика конфиденциальности описывает, какие персональные данные обрабатывает
              приложение «Friday Education» (далее — «Приложение») при использовании учебного центра
              Friday Education, а также как эти данные защищаются. Используя Приложение, вы соглашаетесь
              с обработкой ваших данных в соответствии с настоящим документом.
            </p>
          </section>

          <section>
            <h2 className="text-white text-base font-semibold mb-2">2. Какие данные мы собираем</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Номер телефона и пароль учётной записи (логин и пароль) — для входа в систему.</li>
              <li>ФИО ученика, родителя, учителя и администратора — для ведения учёта в учебном центре.</li>
              <li>Информация об обучении: расписание занятий, посещаемость, домашние задания, оценки и внутренние награды (звёзды).</li>
              <li>Сведения об оплате (сумма, дата, статус) — для учёта платежей за обучение. Платёжные данные карт НЕ собираются и НЕ хранятся.</li>
              <li>Технические данные: IP-адрес, тип устройства и браузера — для корректной работы сервиса и защиты от злоупотреблений.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-base font-semibold mb-2">3. Цели обработки данных</h2>
            <p>Данные используются исключительно для:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>предоставления функций Приложения (учёт учеников, расписание, посещаемость, оплаты);</li>
              <li>идентификации пользователей и защиты учётных записей;</li>
              <li>взаимодействия учебного центра с учениками и родителями.</li>
            </ul>
            <p className="mt-2">
              Мы не передаём ваши данные третьим лицам в маркетинговых целях и не продаём их.
            </p>
          </section>

          <section>
            <h2 className="text-white text-base font-semibold mb-2">4. Хранение и защита данных</h2>
            <p>
              Данные хранятся в защищённой базе данных на серверах хостинг-провайдера. Пароли хранятся
              только в виде bcrypt-хешей и не хранятся в открытом виде. Передача данных между Приложением
              и сервером защищена протоколом HTTPS (TLS). Доступ к данным имеют только авторизованные
              сотрудники учебного центра.
            </p>
          </section>

          <section>
            <h2 className="text-white text-base font-semibold mb-2">5. Файлы cookie и сессии</h2>
            <p>
              Приложение использует HTTP-куки исключительно для поддержания сессии входа. Сторонние
              трекеры, рекламные и аналитические cookie не используются.
            </p>
          </section>

          <section>
            <h2 className="text-white text-base font-semibold mb-2">6. Срок хранения и удаление</h2>
            <p>
              Данные хранятся в течение всего периода использования Приложения и могут быть удалены по
              запросу пользователя. Запрос на удаление или изменение данных направляйте администратору
              учебного центра любым доступным способом (телефон, почта, офис центра).
            </p>
          </section>

          <section>
            <h2 className="text-white text-base font-semibold mb-2">7. Права пользователей</h2>
            <p>
              Вы имеете право на доступ к своим данным, их исправление, ограничение обработки и удаление,
              а также на отзыв согласия на обработку персональных данных в любое время. Для реализации
              прав обращайтесь к администратору учебного центра.
            </p>
          </section>

          <section>
            <h2 className="text-white text-base font-semibold mb-2">8. Контактная информация</h2>
            <p>
              По вопросам конфиденциальности и обработки данных обращайтесь в учебный центр
              Friday Education по телефону <span className="text-slate-200">+998 88 106 06 25</span>.
            </p>
          </section>
        </div>

        <p className="mt-10 text-xs text-slate-500">
          Последнее обновление: 10 сентября 2026 г.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white underline"
        >
          ← Вернуться ко входу
        </Link>
      </div>
    </main>
  );
}