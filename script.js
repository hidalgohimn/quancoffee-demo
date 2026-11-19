(() => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const menuTabs = [...document.querySelectorAll('.menu-tab')];
  const menuCards = [...document.querySelectorAll('.menu-card')];
  const bookingForm = document.getElementById('bookingForm');
  const bookingDate = document.getElementById('bookingDate');
  const formMessage = document.getElementById('formMessage');
  const toast = document.getElementById('toast');

  document.getElementById('year').textContent = new Date().getFullYear();

  // Không cho chọn ngày đã qua trong biểu mẫu đặt bàn.
  if (bookingDate) {
    const localToday = new Date();
    const offset = localToday.getTimezoneOffset();
    const localDate = new Date(localToday.getTime() - offset * 60_000).toISOString().slice(0, 10);
    bookingDate.min = localDate;
  }

  const closeMobileNav = () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Mở menu');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Đóng menu' : 'Mở menu');
  });

  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileNav));

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // Lọc các nhóm món trong thực đơn.
  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;
      menuTabs.forEach(item => {
        const selected = item === tab;
        item.classList.toggle('selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      menuCards.forEach(card => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
    });
  });

  // Đánh dấu mục điều hướng tương ứng với khu vực đang xem.
  const observedSections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const active = navLinks.find(link => link.getAttribute('href') === `#${entry.target.id}`);
        if (active) {
          navLinks.forEach(link => link.classList.toggle('active', link === active));
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    observedSections.forEach(section => observer.observe(section));
  }

  let toastTimer;
  const showToast = message => {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3300);
  };

  bookingForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!bookingForm.reportValidity()) return;

    const formData = new FormData(bookingForm);
    const reservation = {
      name: String(formData.get('name') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      date: String(formData.get('date') || ''),
      time: String(formData.get('time') || ''),
      guests: String(formData.get('guests') || ''),
      zone: String(formData.get('zone') || ''),
      note: String(formData.get('note') || '').trim(),
      createdAt: new Date().toISOString()
    };

    // Lưu mẫu ngay trên thiết bị để người xem thử được luồng đặt bàn.
    // Dữ liệu không được gửi lên máy chủ hay đến nhân viên của quán.
    try {
      const saved = JSON.parse(localStorage.getItem('bookBeanDemoReservations') || '[]');
      saved.push(reservation);
      localStorage.setItem('bookBeanDemoReservations', JSON.stringify(saved));
    } catch (error) {
      // Biểu mẫu vẫn hiển thị xác nhận demo nếu trình duyệt chặn localStorage.
    }

    formMessage.hidden = false;
    formMessage.textContent = `Đã tạo yêu cầu xem thử cho ${reservation.name} vào ${reservation.time}, ngày ${reservation.date}. Đây chưa phải xác nhận đặt bàn; dữ liệu chỉ được lưu trên thiết bị này.`;
    bookingForm.reset();
    if (bookingDate) {
      const now = new Date();
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
      bookingDate.min = localDate;
    }
    showToast('Đã ghi nhận yêu cầu mẫu trên thiết bị.');
  });
})();
