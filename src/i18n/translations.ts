import { LanguageCode } from '../components/views/SettingsView';

export interface Translations {
  restaurantTitle: string;
  localSystem: string;
  connectedLocal: string;
  searchPlaceholder: string;
  todayLabel: string;
  localServerActive: string;
  operationsAlerts: string;
  unreadCount: string;
  switchRole: string;
  currency: string;
  afn: string;
  common: {
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    confirm: string;
    print: string;
    search: string;
    filter: string;
    export: string;
    refresh: string;
    close: string;
    back: string;
    add: string;
    all: string;
    status: string;
    actions: string;
    notes: string;
    price: string;
    details: string;
    success: string;
    error: string;
    active: string;
    inactive: string;
    total: string;
    subtotal: string;
    discount: string;
    tax: string;
    quantity: string;
    person: string;
    minutes: string;
    yes: string;
    no: string;
  };
  sections: {
    operations: string;
    foodInventory: string;
    customersStaff: string;
    systemReports: string;
  };
  nav: {
    dashboard: string;
    tables: string;
    waiter: string;
    pos: string;
    orders: string;
    kds: string;
    menu: string;
    inventory: string;
    customers: string;
    staff: string;
    reports: string;
    devices: string;
    settings: string;
  };
  roles: {
    MANAGER: { title: string; badge: string };
    WAITER: { title: string; badge: string };
    CASHIER: { title: string; badge: string };
    KITCHEN: { title: string; badge: string };
    CUSTOMER: { title: string; badge: string };
  };
  dashboard: {
    title: string;
    subtitle: string;
    floorMap: string;
    newOrderPos: string;
    grossSalesToday: string;
    comparedToNormal: string;
    settledInvoices: string;
    avgPerInvoice: string;
    tableOccupancy: string;
    occupiedOutOf: string;
    occupiedRate: string;
    lowStockAlerts: string;
    healthyStock: string;
    criticalLow: string;
    activeLiveOrders: string;
    viewAllOrders: string;
    tableCol: string;
    itemsCol: string;
    timeCol: string;
    totalCol: string;
    statusCol: string;
    quickActions: string;
    quickPOS: string;
    quickPOSDesc: string;
    quickTables: string;
    quickTablesDesc: string;
    quickKDS: string;
    quickKDSDesc: string;
    quickReports: string;
    quickReportsDesc: string;
    bestSellersToday: string;
    salesCount: string;
    localServerSync: string;
  };
  tables: {
    title: string;
    subtitle: string;
    allSections: string;
    mainHall: string;
    familySection: string;
    terrace: string;
    vipSection: string;
    allStatuses: string;
    available: string;
    occupied: string;
    reserved: string;
    cleaning: string;
    seats: string;
    personCapacity: string;
    openNewOrder: string;
    viewActiveOrder: string;
    printTableQr: string;
    changeStatus: string;
    clearAndClean: string;
    guestName: string;
    elapsedTime: string;
    totalAmount: string;
  };
  waiter: {
    title: string;
    subtitle: string;
    activeTablesList: string;
    guestCallsAndAlerts: string;
    noActiveCalls: string;
    requestWater: string;
    requestBread: string;
    requestBill: string;
    callWaiter: string;
    sendToKitchen: string;
    orderItems: string;
    addItem: string;
    seatNumber: string;
    orderNotes: string;
    specialInstructions: string;
    markDelivered: string;
    urgentBadge: string;
  };
  pos: {
    title: string;
    subtitle: string;
    searchDishPlaceholder: string;
    allCategories: string;
    currentOrderCart: string;
    emptyCartNotice: string;
    seatLabel: string;
    allSeats: string;
    discountAmount: string;
    taxAmount: string;
    grandTotal: string;
    paymentMethod: string;
    cash: string;
    card: string;
    splitBill: string;
    settleAndInvoice: string;
    printKitchenTicket: string;
    tableSelection: string;
    customerSelection: string;
    cashReceived: string;
    cashChange: string;
  };
  orders: {
    title: string;
    subtitle: string;
    filterByStatus: string;
    orderId: string;
    table: string;
    guest: string;
    items: string;
    amount: string;
    placedTime: string;
    orderStatus: string;
    actions: string;
    pending: string;
    cooking: string;
    ready: string;
    served: string;
    paid: string;
    cancelled: string;
  };
  kds: {
    title: string;
    subtitle: string;
    allStations: string;
    grillStation: string;
    localStation: string;
    fastfoodStation: string;
    drinksStation: string;
    dessertStation: string;
    pendingCook: string;
    inProgress: string;
    readyToServe: string;
    startCooking: string;
    completeDish: string;
    elapsedTime: string;
    orderNote: string;
    seatNote: string;
    stationActive: string;
  };
  menu: {
    title: string;
    subtitle: string;
    addNewDish: string;
    dishName: string;
    category: string;
    price: string;
    station: string;
    isAvailable: string;
    availableBadge: string;
    outOfStockBadge: string;
    rating: string;
    description: string;
    editDishTitle: string;
    itemName?: string;
  };
  inventory: {
    title: string;
    subtitle: string;
    addNewStock: string;
    itemName: string;
    currentQuantity: string;
    minQuantity: string;
    unit: string;
    unitPrice: string;
    status: string;
    supplier: string;
    healthy: string;
    lowStock: string;
    criticalStock: string;
    reorderBtn: string;
    unitCost?: string;
  };
  crm: {
    title: string;
    subtitle: string;
    addNewCustomer: string;
    customerName: string;
    phoneNumber: string;
    totalVisits: string;
    totalSpent: string;
    loyaltyPoints: string;
    customerTier: string;
    lastVisitDate: string;
    vip: string;
    regular: string;
    newCustomer: string;
  };
  staff: {
    title: string;
    subtitle: string;
    addNewStaff: string;
    fullName: string;
    role: string;
    shift: string;
    phone: string;
    status: string;
    salary: string;
    active: string;
    offDuty: string;
    morningShift: string;
    nightShift: string;
    fullDayShift: string;
    employeeName?: string;
    employeeCode?: string;
    phoneNumber?: string;
    shiftTime?: string;
    attendance?: string;
    present?: string;
    absent?: string;
  };
  reports: {
    title: string;
    subtitle: string;
    todaySales: string;
    totalOrders: string;
    avgOrderValue: string;
    netProfit: string;
    popularDishes: string;
    paymentMethodsBreakdown: string;
    cashPayment: string;
    cardPayment: string;
    printReport: string;
    exportExcel: string;
    grossProfit?: string;
    profitMargin?: string;
    avgTableTurnover?: string;
    minutes?: string;
    topSellingDishes?: string;
    excelExport?: string;
  };
  devices: {
    title: string;
    subtitle: string;
    totalDevices: string;
    onlineDevices: string;
    offlineDevices: string;
    deviceName: string;
    deviceType: string;
    ipAddress: string;
    lastPing: string;
    status: string;
    online: string;
    blocked: string;
    toggleBlock: string;
    broadcastNotice: string;
    broadcastPlaceholder: string;
    sendBroadcast: string;
  };
  splitBill: {
    title: string;
    subtitle: string;
    bySeat: string;
    fullPayTitle: string;
    customAmount: string;
    paid: string;
    remaining: string;
    payShare: string;
    settledNotice: string;
    finishAndClose: string;
  };
  settings: {
    title: string;
    subtitle: string;
    generalSettings: string;
    restaurantName: string;
    branchAddress: string;
    contactPhone: string;
    currencySetting: string;
    languageSetting: string;
    systemLanguage: string;
    selectLanguage: string;
    wifiQrSection: string;
    wifiSsid: string;
    wifiPassword: string;
    printTableCards: string;
    backupAndRestore: string;
    downloadBackup: string;
    saveChanges: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  fa: {
    restaurantTitle: 'رستوران آریا گریل',
    localSystem: 'سامانه محلی (Local-First)',
    connectedLocal: 'شبکه محلی متصل',
    searchPlaceholder: 'جستجوی میز، سفارش، مشتری...',
    todayLabel: 'امروز، ۳ مهر ۱۴۰۵',
    localServerActive: 'سرور محلی فعال',
    operationsAlerts: 'هشدارهای عملیاتی',
    unreadCount: 'پیام خوانده نشده',
    switchRole: 'تغییر نمای کاربری (سوییچ نقش)',
    currency: 'افغانی',
    afn: 'AFN',
    common: {
      save: 'ذخیره تغییرات',
      cancel: 'انصراف',
      edit: 'ویرایش',
      delete: 'حذف',
      confirm: 'تأیید',
      print: 'چاپ فاکتور',
      search: 'جستجو...',
      filter: 'فیلتر دسته‌بندی',
      export: 'خروجی اکسل/PDF',
      refresh: 'بروزرسانی',
      close: 'بستن',
      back: 'بازگشت',
      add: 'افزودن جدید',
      all: 'همه موارد',
      status: 'وضعیت',
      actions: 'عملیات',
      notes: 'توضیحات و یادداشت',
      price: 'قیمت',
      details: 'جزئیات',
      success: 'عملیات با موفقیت انجام شد',
      error: 'خطا در ثبت اطلاعات',
      active: 'فعال',
      inactive: 'غیرفعال',
      total: 'مجموع کل',
      subtotal: 'جمع جزء',
      discount: 'تخفیف',
      tax: 'مالیات و عوارض',
      quantity: 'تعداد',
      person: 'نفر',
      minutes: 'دقیقه',
      yes: 'بله',
      no: 'خیر',
    },
    sections: {
      operations: 'عملیات سالن و فروش',
      foodInventory: 'مدیریت غذا و انبار',
      customersStaff: 'مشتریان و پرسنل',
      systemReports: 'سیستم و گزارشات',
    },
    nav: {
      dashboard: 'داشبورد (Dashboard)',
      tables: 'میزها (Tables)',
      waiter: 'اپ گارسون (Waiter App)',
      pos: 'صندوق و پرداخت (POS)',
      orders: 'سفارشات فعال (Orders)',
      kds: 'آشپزخانه و بخش‌ها (Kitchen)',
      menu: 'مدیریت منو (Menu)',
      inventory: 'موجودی انبار (Inventory)',
      customers: 'مشتریان و وفاداری (CRM)',
      staff: 'کارمندان (Staff)',
      reports: 'گزارش‌ها (Reports)',
      devices: 'مدیریت دستگاه‌ها (Devices)',
      settings: 'تنظیمات و چاپ QR (Settings)',
    },
    roles: {
      MANAGER: { title: 'مدیر رستوران', badge: 'دسترسی کامل' },
      WAITER: { title: 'گارسون سالن', badge: 'سفارش و میزها' },
      CASHIER: { title: 'صندوقدار', badge: 'پرداخت و فاکتور' },
      KITCHEN: { title: 'سرآشپز / KDS', badge: 'صف پخت و تحویل' },
      CUSTOMER: { title: 'مشتری سر میز', badge: 'اپ اختصاصی QR' },
    },
    dashboard: {
      title: 'مرکز کنترل عملیات رستوران',
      subtitle: 'گزارش عملکرد زنده امروز • آخرین همگام‌سازی محلی: ۱ دقیقه پیش',
      floorMap: 'نقشه سالن',
      newOrderPos: '+ سفارش جدید (POS)',
      grossSalesToday: 'فروش ناخالص امروز',
      comparedToNormal: 'نسبت به میانگین روزهای عادی',
      settledInvoices: 'تعداد فاکتورهای تسویه شده',
      avgPerInvoice: 'میانگین هر فاکتور',
      tableOccupancy: 'ضریب اشغال میزها',
      occupiedOutOf: 'میز در حال پذیرایی',
      occupiedRate: 'اشغال',
      lowStockAlerts: 'هشدارهای کسری انبار',
      healthyStock: 'موجودی انبار در وضعیت پایدار',
      criticalLow: 'قلم در نقطه سفارش بحرانی',
      activeLiveOrders: 'سفارشات جاری و فعال',
      viewAllOrders: 'مشاهده همه سفارشات',
      tableCol: 'میز / شماره',
      itemsCol: 'اقلام سفارش',
      timeCol: 'زمان ثبت',
      totalCol: 'مبلغ کل',
      statusCol: 'وضعیت',
      quickActions: 'دسترسی سریع بخش‌ها',
      quickPOS: 'صندوق فروش (POS)',
      quickPOSDesc: 'صدور فاکتور و تسویه حساب فوری میز',
      quickTables: 'نقشه سالن (Floor)',
      quickTablesDesc: 'مشاهده وضعیت صندلی‌ها و پذیرش مهمان',
      quickKDS: 'نمایشگر آشپزخانه (KDS)',
      quickKDSDesc: 'مدیریت صف سفارشات و مانیتورینگ سرآشپز',
      quickReports: 'گزارشات مالی',
      quickReportsDesc: 'تحلیل دقیق درآمد، سود و خروجی اکسل',
      bestSellersToday: 'پرفروش‌ترین غذاهای امروز',
      salesCount: 'پرس سفارش داده شده',
      localServerSync: 'سرور محلی فعال و همگام',
    },
    tables: {
      title: 'مدیریت سالن و میزهای رستوران',
      subtitle: 'وضعیت زنده اشغال، سفارشات سر میز و چاپ استند بارکد QR اختصاصی',
      allSections: 'همه بخش‌های سالن',
      mainHall: 'سالن اصلی',
      familySection: 'بخش خانوادگی',
      terrace: 'فضای باز و تراس',
      vipSection: 'سالن VIP و تشریفات',
      allStatuses: 'همه وضعیت‌ها',
      available: 'میز خالی و آماده',
      occupied: 'در حال پذیرایی',
      reserved: 'رزرو شده',
      cleaning: 'نیاز به نظافت',
      seats: 'نفره',
      personCapacity: 'ظرفیت صندلی',
      openNewOrder: 'شروع سفارش جدید',
      viewActiveOrder: 'مشاهده فاکتور و اقلام',
      printTableQr: 'چاپ استند QR میز',
      changeStatus: 'تغییر وضعیت دستی',
      clearAndClean: 'تسویه و اعلام نظافت',
      guestName: 'مهمان',
      elapsedTime: 'مدت حضور',
      totalAmount: 'مبلغ جاری',
    },
    waiter: {
      title: 'اپلیکیشن تبلت گارسون سالن',
      subtitle: 'ثبت سریع سفارشات سر میز، دریافت هشدارهای زنده مهمانان و ارسال مستقیم به آشپزخانه',
      activeTablesList: 'میزهای فعال سالن',
      guestCallsAndAlerts: 'فراخوان‌ها و درخواست‌های فوری مهمانان',
      noActiveCalls: 'در حال حاضر هیچ درخواستی ثبت نشده است',
      requestWater: 'درخواست آب معدنی',
      requestBread: 'درخواست نان گرم اضافه',
      requestBill: 'درخواست صورت‌حساب سر میز',
      callWaiter: 'فراخوانی گارسون',
      sendToKitchen: 'ارسال سفارش به آشپزخانه (KDS)',
      orderItems: 'اقلام سفارش میز',
      addItem: 'افزودن غذا / نوشیدنی',
      seatNumber: 'شماره صندلی',
      orderNotes: 'توضیحات خاص مشتری (پیاز، تندی و...)',
      specialInstructions: 'دستورالعمل سرآشپز',
      markDelivered: 'تحویل داده شد',
      urgentBadge: 'فوری',
    },
    pos: {
      title: 'صندوق فروش و تسویه حساب (POS)',
      subtitle: 'ثبت سریع اقلام، محاسبه خودکار تخفیف و مالیات، تسویه نقدی، کارتی و دنگی فاکتور',
      searchDishPlaceholder: 'جستجوی نام یا کد غذا...',
      allCategories: 'همه دسته‌ها',
      currentOrderCart: 'سبد سفارش جاری',
      emptyCartNotice: 'هیچ غذایی انتخاب نشده است',
      seatLabel: 'صندلی',
      allSeats: 'تمام صندلی‌های میز',
      discountAmount: 'تخفیف',
      taxAmount: 'مالیات و عوارض (۰٪)',
      grandTotal: 'مبلغ قابل پرداخت',
      paymentMethod: 'شیوه پرداخت',
      cash: 'نقدی (اسکناس افغانی)',
      card: 'کارت‌خوان بانکی (POS)',
      splitBill: 'تقسیم فاکتور (دنگی)',
      settleAndInvoice: 'تسویه نهایی و چاپ فاکتور',
      printKitchenTicket: 'چاپ فیش آشپزخانه',
      tableSelection: 'انتخاب میز',
      customerSelection: 'انتخاب مشتری (اختیاری)',
      cashReceived: 'مبلغ دریافتی از مشتری',
      cashChange: 'باقی‌مانده قابل برگشت',
    },
    orders: {
      title: 'سفارشات فعال و جاری',
      subtitle: 'پیگیری زنده وضعیت پخت، تحویل و تسویه کلیه سفارشات رستوران در شبکه محلی',
      filterByStatus: 'فیلتر بر اساس وضعیت',
      orderId: 'شماره سفارش',
      table: 'میز',
      guest: 'مشتری / سفارش‌دهنده',
      items: 'اقلام سفارش',
      amount: 'مبلغ کل',
      placedTime: 'زمان ثبت',
      orderStatus: 'وضعیت پخت و تحویل',
      actions: 'اقدامات',
      pending: 'در انتظار پخت',
      cooking: 'در حال پخت روی گریل/دیگ',
      ready: 'آماده تحویل سر میز',
      served: 'سرو شده',
      paid: 'تسویه شده',
      cancelled: 'لغو شده',
    },
    kds: {
      title: 'نمایشگر آشپزخانه (KDS)',
      subtitle: 'مدیریت و تفکیک صف سفارشات پخت بر اساس ایستگاه‌های کاری گریل، سنتی، فست‌فود و نوشیدنی',
      allStations: 'تمام ایستگاه‌های آشپزخانه',
      grillStation: 'ایستگاه کباب و گریل',
      localStation: 'ایستگاه غذاهای محلی (قابلی، منتو)',
      fastfoodStation: 'ایستگاه فست‌فود و پیتزا',
      drinksStation: 'ایستگاه نوشیدنی‌ها',
      dessertStation: 'ایستگاه دسر و چای‌خانه',
      pendingCook: 'در صف آماده‌سازی',
      inProgress: 'در حال پخت',
      readyToServe: 'آماده سرو و تحویل به گارسون',
      startCooking: 'شروع پخت',
      completeDish: 'اعلام آماده بودن غذا',
      elapsedTime: 'زمان سپری شده',
      orderNote: 'توضیحات ویژه سفارش',
      seatNote: 'صندلی',
      stationActive: 'ایستگاه فعال',
    },
    menu: {
      title: 'مدیریت منو و قیمت‌گذاری غذاها',
      subtitle: 'افزودن و ویرایش غذاها، تنظیم ایستگاه آشپزخانه، مدیریت موجودی و کنترل قیمت‌ها',
      addNewDish: 'افزودن غذای جدید به منو',
      dishName: 'نام غذا',
      category: 'دسته‌بندی',
      price: 'قیمت فروش (افغانی)',
      station: 'ایستگاه پخت آشپزخانه',
      isAvailable: 'وضعیت در دسترس بودن',
      availableBadge: 'موجود در منو',
      outOfStockBadge: 'ناموجود / تمام شده',
      rating: 'امتیاز رضایت مشتریان',
      description: 'مواد اولیه و توضیحات طعم',
      editDishTitle: 'ویرایش مشخصات غذا',
      itemName: 'نام غذا',
    },
    inventory: {
      title: 'انبارداری و موجودی مواد اولیه',
      subtitle: 'نظارت دقیق بر ذخایر گوشت، برنج، روغن، زعفران و هشدارهای هوشمند کسری کالا',
      addNewStock: 'ثبت ورود کالای جدید به انبار',
      itemName: 'نام کالا / ماده اولیه',
      currentQuantity: 'موجودی فعلی',
      minQuantity: 'حداقل نقطه سفارش',
      unit: 'واحد سنجش',
      unitPrice: 'قیمت واحد (افغانی)',
      status: 'وضعیت ذخیره',
      supplier: 'تأمین‌کننده',
      healthy: 'موجودی کافی و پایدار',
      lowStock: 'رو به اتمام',
      criticalStock: 'بحرانی و نیازمند خرید فوری',
      reorderBtn: 'شارژ موجودی',
      unitCost: 'قیمت خرید',
    },
    crm: {
      title: 'مدیریت مشتریان و باشگاه وفاداری (CRM)',
      subtitle: 'بانک اطلاعات مشتریان، سابقه مراجعات، جمع مبالغ خرید و امتیازات تخفیف',
      addNewCustomer: 'ثبت مشخصات مشتری جدید',
      customerName: 'نام و تخلص مشتری',
      phoneNumber: 'شماره تماس',
      totalVisits: 'تعداد مراجعات',
      totalSpent: 'مجموع خریدهای قبلی',
      loyaltyPoints: 'امتیاز وفاداری',
      customerTier: 'سطح عضویت',
      lastVisitDate: 'تاریخ آخرین مراجعه',
      vip: 'مشتری VIP ویژه',
      regular: 'مشتری دائمی',
      newCustomer: 'مشتری جدید',
    },
    staff: {
      title: 'پرسنل، گارسون‌ها و شیفت‌های کاری',
      subtitle: 'مدیریت پرسنل سالن، آشپزخانه و صندوق، ثبت شماره تماس و نظارت بر وضعیت حضور',
      addNewStaff: 'افزودن کارمند جدید',
      fullName: 'نام و نام خانوادگی',
      role: 'سمت کاری در رستوران',
      shift: 'شیفت کاری',
      phone: 'شماره تماس',
      status: 'وضعیت حضور',
      salary: 'حقوق ماهانه (AFN)',
      active: 'حاضر در رستوران',
      offDuty: 'پایان شیفت / مرخصی',
      morningShift: 'شیفت صبح (۰۸:۰۰ الی ۱۶:۰۰)',
      nightShift: 'شیفت عصر و شب (۱۶:۰۰ الی ۲۴:۰۰)',
      fullDayShift: 'تمام وقت',
      employeeName: 'نام کارمند',
      employeeCode: 'کد پرسنلی',
      phoneNumber: 'شماره تماس',
      shiftTime: 'شیفت کاری',
      attendance: 'وضعیت حضور',
      present: 'حاضر',
      absent: 'مرخصی / غایب',
    },
    reports: {
      title: 'گزارشات مالی و عملکرد رستوران',
      subtitle: 'تحلیل دقیق درآمد ناخالص، فروش روزانه، شیوه‌های پرداخت و شناسایی غذاهای پرفروش',
      todaySales: 'کل فروش ناخالص امروز',
      totalOrders: 'تعداد کل سفارشات ثبت‌شده',
      avgOrderValue: 'میانگین هر سفارش',
      netProfit: 'سود ناخالص تخمینی',
      popularDishes: 'رتبه‌بندی محبوب‌ترین غذاها',
      paymentMethodsBreakdown: 'ترکیب شیوه‌های پرداخت',
      cashPayment: 'دریافتی نقد (افغانی)',
      cardPayment: 'دریافتی کارت‌خوان بانکی',
      printReport: 'چاپ گزارش روزانه (Print)',
      exportExcel: 'خروجی اکسل (Excel Export)',
      grossProfit: 'سود ناخالص عملیاتی',
      profitMargin: 'حاشیه سود',
      avgTableTurnover: 'میانگین گردش هر میز',
      minutes: 'دقیقه',
      topSellingDishes: 'غذاهای پرفروش امروز',
      excelExport: 'خروجی اکسل',
    },
    devices: {
      title: 'مدیریت دستگاه‌های متصل در شبکه محلی',
      subtitle: 'نظارت بر تبلت‌های گارسون‌ها، مانیتورهای آشپزخانه و پایانه‌های صندوق متصل به سرور',
      totalDevices: 'کل دستگاه‌های شناخته‌شده',
      onlineDevices: 'دستگاه‌های آنلاین',
      offlineDevices: 'دستگاه‌های آفلاین',
      deviceName: 'نام دستگاه / شناسه',
      deviceType: 'نوع پایانه',
      ipAddress: 'آدرس IP محلی',
      lastPing: 'آخرین پاسخ (Ping)',
      status: 'وضعیت دسترسی',
      online: 'آنلاین و فعال',
      blocked: 'مسدود شده',
      toggleBlock: 'تغییر وضعیت دسترسی',
      broadcastNotice: 'ارسال پیام همگانی به تبلت‌ها',
      broadcastPlaceholder: 'متن پیام عملیاتی به تمام صفحات...',
      sendBroadcast: 'ارسال اعلان فوری',
    },
    splitBill: {
      title: 'تسویه حساب و پرداخت دنگی (Split Bill)',
      subtitle: 'تفکیک صورتحساب بر اساس صندلی‌های مهمانان یا پرداخت مبالغ دلخواه',
      bySeat: 'روش ۱: پرداخت بر اساس صندلی و غذای سفارش داده شده',
      fullPayTitle: 'تسویه یکجای باقیمانده صورتحساب',
      customAmount: 'روش ۲: پرداخت مبلغ دلخواه و دلخواهانه',
      paid: 'پرداخت شده',
      remaining: 'باقیمانده',
      payShare: 'پرداخت سهم',
      settledNotice: 'صورتحساب این میز به طور کامل تسویه گردید. میز آماده تحویل است.',
      finishAndClose: 'ثبت نهایی و ترخیص میز',
    },
    settings: {
      title: 'تنظیمات سامانه و ایستگاه چاپ بارکد QR',
      subtitle: 'پیکربندی هویت رستوران، شبکه وای‌فای محلی، زبان سیستم و صدور کارت رومیزی مهمانان',
      generalSettings: 'تنظیمات عمومی و برند',
      restaurantName: 'نام رسمی رستوران',
      branchAddress: 'آدرس شعبه',
      contactPhone: 'شماره تلفن رستوران',
      currencySetting: 'واحد پول پیش‌فرض',
      languageSetting: 'زبان و گویش سامانه',
      systemLanguage: 'انتخاب زبان فعال سیستم',
      selectLanguage: 'تغییر زبان به دری، پشتو یا انگلیسی تمام بخش‌ها را بلافاصله هماهنگ می‌کند.',
      wifiQrSection: 'تنظیمات وای‌فای و چاپ استند بارکد هوشمند',
      wifiSsid: 'نام شبکه وای‌فای مهمان (SSID)',
      wifiPassword: 'رمز عبور وای‌فای (WPA2)',
      printTableCards: 'پیش‌نمایش و چاپ کارت استند میزها',
      backupAndRestore: 'پشتیبان‌گیری از اطلاعات پایگاه داده',
      downloadBackup: 'دانلود فایل پشتیبان کامل (JSON)',
      saveChanges: 'ذخیره تنظیمات روی سرور محلی',
    },
  },
  ps: {
    restaurantTitle: 'آریا ګریل رستورانت',
    localSystem: 'محلي سیسټم (Local-First)',
    connectedLocal: 'محلي شبکه وصل ده',
    searchPlaceholder: 'د میز، فرمایش، پېرودونکي پلټنه...',
    todayLabel: 'نن، ۳ د تلې ۱۴۰۵',
    localServerActive: 'محلي سرور فعال دی',
    operationsAlerts: 'عملیاتي خبرتیاوې',
    unreadCount: 'نه لوستل شوي پیغامونه',
    switchRole: 'د کارونکي رول بدلول',
    currency: 'افغانۍ',
    afn: 'AFN',
    common: {
      save: 'بدلونونه خوندي کړئ',
      cancel: 'لغوه کول',
      edit: 'سمول',
      delete: 'ړنګول',
      confirm: 'تایید',
      print: 'بل چاپول',
      search: 'پلټنه...',
      filter: 'د ډلبندۍ فلټر',
      export: 'راپور صادرول',
      refresh: 'تازه کول',
      close: 'بندول',
      back: 'شاته تګ',
      add: 'نوی ورزیاتول',
      all: 'ټول توکي',
      status: 'حالت',
      actions: 'کړنې',
      notes: 'توضیحات او یادښت',
      price: 'بیه',
      details: 'تفصیلات',
      success: 'کړنه په بریالیتوب سره وشوه',
      error: 'په معلوماتو ثبتولو کې ستونزه',
      active: 'فعال',
      inactive: 'غیرفعال',
      total: 'ټولیز رقم',
      subtotal: 'فرعي ټولیز',
      discount: 'تخفیف',
      tax: 'مالیه او محصول',
      quantity: 'شمېر',
      person: 'کس',
      minutes: 'دقیقې',
      yes: 'هو',
      no: 'نه',
    },
    sections: {
      operations: 'د سالون او خرڅلاو عملیات',
      foodInventory: 'د خواړو او زېرمتون اداره',
      customersStaff: 'پېرودونکي او کارکوونکي',
      systemReports: 'سیسټم او راپورونه',
    },
    nav: {
      dashboard: 'ډشبورډ (Dashboard)',
      tables: 'میزونه (Tables)',
      waiter: 'د ویټر اپلیکیشن (Waiter App)',
      pos: 'صندوق او تادیه (POS)',
      orders: 'فعال فرمایشونه (Orders)',
      kds: 'پخلنځی او څانګې (Kitchen)',
      menu: 'د مینو مدیریت (Menu)',
      inventory: 'د زېرمتون موجودي (Inventory)',
      customers: 'پېرودونکي او وفاداري (CRM)',
      staff: 'کارکوونکي (Staff)',
      reports: 'راپورونه (Reports)',
      devices: 'د وسایلو مدیریت (Devices)',
      settings: 'تنظیمات او د QR چاپ (Settings)',
    },
    roles: {
      MANAGER: { title: 'د رستورانت مدیر', badge: 'بشپړ واک' },
      WAITER: { title: 'د سالون ویټر', badge: 'فرمایش او میزونه' },
      CASHIER: { title: 'خزانه‌دار (صندوق)', badge: 'تادیه او بل' },
      KITCHEN: { title: 'سرآشپز / KDS', badge: 'د پخولو قطار' },
      CUSTOMER: { title: 'مېلمه پر میز', badge: 'ځانګړی QR اپلیکیشن' },
    },
    dashboard: {
      title: 'د رستورانت عملیاتي کنټرول ډشبورډ',
      subtitle: 'د نن ورځې ژوندی راپور • وروستی محلي نښلون: ۱ دقیقه وړاندې',
      floorMap: 'د سالون نقشه',
      newOrderPos: '+ نوی فرمایش (POS)',
      grossSalesToday: 'د نن ورځې ناخالص خرڅلاو',
      comparedToNormal: 'د عادي ورځو په پرتله',
      settledInvoices: 'د تصفیه شوو بلونو شمېر',
      avgPerInvoice: 'د هر بل اوسط رقم',
      tableOccupancy: 'د میزونو د ډکوالي کچه',
      occupiedOutOf: 'میزونه ډک دي',
      occupiedRate: 'ډکوالی',
      lowStockAlerts: 'د زېرمتون خبرتیاوې',
      healthyStock: 'د توکو زېرمه مناسبه ده',
      criticalLow: 'توکي نږدې دي خلاص شي',
      activeLiveOrders: 'روان او فعال فرمایشونه',
      viewAllOrders: 'ټول فرمایشونه کتل',
      tableCol: 'میز / شمېره',
      itemsCol: 'د فرمایش توکي',
      timeCol: 'د ثبت وخت',
      totalCol: 'ټولیز رقم',
      statusCol: 'حالت',
      quickActions: 'ګړندی لاسرسی',
      quickPOS: 'د خرڅلاو صندوق (POS)',
      quickPOSDesc: 'د بل صادرول او نغده یا کارتي تادیه',
      quickTables: 'د سالون نقشه (Floor)',
      quickTablesDesc: 'د خالي او ډکو میزونو کتل او د مېلمه ناسته',
      quickKDS: 'د پخلنځي سکرین (KDS)',
      quickKDSDesc: 'د پخلي د نوبت کتنه او د سرآشپز څارنه',
      quickReports: 'مالي راپورونه',
      quickReportsDesc: 'د عاید، ګټې او خرڅلاو بشپړ راپور',
      bestSellersToday: 'د نن ورځې ډېر پلورل شوي خواړه',
      salesCount: 'خوراکه پلورل شوي',
      localServerSync: 'محلي سرور فعال او وصل دی',
    },
    tables: {
      title: 'د سالون او میزونو اداره',
      subtitle: 'د میزونو حالت، د فرمایش کتنه او د ځانګړي QR بارکوډ چاپول',
      allSections: 'د سالون ټولې څانګې',
      mainHall: 'عمومي سالون',
      familySection: 'د کورنیو ځانګړې څانګه',
      terrace: 'خلاصه فضا او چت',
      vipSection: 'د VIP ځانګړی سالون',
      allStatuses: 'ټول حالتونه',
      available: 'خالي او چمتو میز',
      occupied: 'میلمه ناست دی',
      reserved: 'ساتل شوی (ریزرو)',
      cleaning: 'پاکولو ته اړتیا لري',
      seats: 'کسيز',
      personCapacity: 'د ناستې ظرفیت',
      openNewOrder: 'نوی فرمایش پیل کړئ',
      viewActiveOrder: 'د بل او توکو لیدل',
      printTableQr: 'د میز د QR سټینډ چاپ',
      changeStatus: 'د حالت بدلول',
      clearAndClean: 'تصفیه او پاکول',
      guestName: 'مېلمه',
      elapsedTime: 'د ناستې موده',
      totalAmount: 'روان رقم',
    },
    waiter: {
      title: 'د سالون ویټر ټابلیټ اپلیکیشن',
      subtitle: 'پر میز د چټک فرمایش ثبتول، د مېلمه غږ او پخلنځي ته نېغ په نېغه استول',
      activeTablesList: 'د سالون فعال میزونه',
      guestCallsAndAlerts: 'د مېلمنو بیړني غوښتنلیکونه',
      noActiveCalls: 'اوس مهال کوم غوښتنلیک نشته',
      requestWater: 'د معدني اوبو غوښتنه',
      requestBread: 'د تودې ډوډۍ غوښتنه',
      requestBill: 'د میز د بل راغوښتل',
      callWaiter: 'د ویټر غوښتل',
      sendToKitchen: 'پخلنځي ته استول (KDS)',
      orderItems: 'د میز فرمایش شوي توکي',
      addItem: 'د خواړو/څښاک زیاتول',
      seatNumber: 'د څوکۍ شمېره',
      orderNotes: 'د پېرودونکي ځانګړې غوښتنه (پیاز، توندوالی او داسې نور)',
      specialInstructions: 'د پخلي لارښوونه',
      markDelivered: 'ورکړل شو',
      urgentBadge: 'بیړنی',
    },
    pos: {
      title: 'د خزانې صندوق او تادیه (POS)',
      subtitle: 'د توکو چټک انتخاب، د تخفیف او مالیې اتومات حساب او په نغده، کارت یا جلا توګه بل',
      searchDishPlaceholder: 'د خواړو نوم یا کوډ وپلټئ...',
      allCategories: 'ټولې ډلې',
      currentOrderCart: 'د فرمایش ټوکرۍ',
      emptyCartNotice: 'کوم خواړه نه دي ټاکل شوي',
      seatLabel: 'څوکۍ',
      allSeats: 'د میز ټولې څوکۍ',
      discountAmount: 'تخفیف',
      taxAmount: 'مالیه (۰٪)',
      grandTotal: 'د ورکړې ټولیز رقم',
      paymentMethod: 'د تادیې طریقه',
      cash: 'نغدې افغانۍ',
      card: 'بانکي کارت (POS)',
      splitBill: 'د بل وېشل (دانګي)',
      settleAndInvoice: 'تصفیه او د بل چاپ',
      printKitchenTicket: 'د پخلنځي فیش چاپ',
      tableSelection: 'د میز ټاکنه',
      customerSelection: 'د پیرودونکي ټاکنه',
      cashReceived: 'له مېلمه اخیستل شوې پیسې',
      cashChange: 'بېرته ورکول کېدونکې پیسې',
    },
    orders: {
      title: 'روان او فعال فرمایشونه',
      subtitle: 'په محلي شبکه کې د پخلي، سپارلو او تادیې د حالت ژوندی څار',
      filterByStatus: 'د حالت له مخې چاڼ',
      orderId: 'د فرمایش شمېره',
      table: 'میز',
      guest: 'مېلمه / پېرودونکی',
      items: 'د فرمایش توکي',
      amount: 'ټولیز رقم',
      placedTime: 'د ثبت وخت',
      orderStatus: 'د پخلي او وېش حالت',
      actions: 'کړنې',
      pending: 'د پخلي په تمه',
      cooking: 'د پخېدو په حال کې',
      ready: 'میز ته سپارلو ته چمتو',
      served: 'سپارل شوی',
      paid: 'تادیه شوی',
      cancelled: 'لغوه شوی',
    },
    kds: {
      title: 'د پخلنځي سکرین (KDS)',
      subtitle: 'د کباب، محلي، فست‌فود او څښاک پر بنسټ د پخلي قطار تنظیم او لارښوونه',
      allStations: 'د پخلنځي ټولې څانګې',
      grillStation: 'د کباب او ګریل څانګه',
      localStation: 'د محلي خواړو څانګه (قابلي، منتو)',
      fastfoodStation: 'د فست‌فود او پیتزا څانګه',
      drinksStation: 'د څښاک څانګه',
      dessertStation: 'د خوږو او چای څانګه',
      pendingCook: 'د چمتووالي په قطار کې',
      inProgress: 'د پخېدو په حال کې',
      readyToServe: 'ویټر ته سپارلو ته چمتو',
      startCooking: 'پخلی پیل کړئ',
      completeDish: 'د چمتووالي اعلان',
      elapsedTime: 'تېر شوی وخت',
      orderNote: 'ځانګړی یادښت',
      seatNote: 'څوکۍ',
      stationActive: 'فعاله څانګه',
    },
    menu: {
      title: 'د مینو مدیریت او بیې ټاکل',
      subtitle: 'د نوي خواړو زیاتول، د پخلنځي څانګې ټاکل، موجودي او د بیو سمون',
      addNewDish: 'په مینو کې نوي خواړه زیاتول',
      dishName: 'د خواړو نوم',
      category: 'ډلبندي',
      price: 'د پلور بیه (افغانۍ)',
      station: 'د پخلنځي کاري څانګه',
      isAvailable: 'شتون او چمتووالی',
      availableBadge: 'په مینو کې شته',
      outOfStockBadge: 'خلاص شوي / نشته',
      rating: 'د مراجعینو د خوښې کچه',
      description: 'اصلي توکي او خوند',
      editDishTitle: 'د خواړو سمول',
      itemName: 'د خواړو نوم',
    },
    inventory: {
      title: 'د زېرمتون او لومړنیو توکو موجودي',
      subtitle: 'د غوښې، وریجو، غوړیو او زعفرانو څارنه او د خلاصېدو پر مهال هوښیار خبرداری',
      addNewStock: 'زېرمتون ته د نوي توکي ننوتل',
      itemName: 'د توکي نوم',
      currentQuantity: 'اوسنۍ زېرمه',
      minQuantity: 'د بیا پېرلو ټیټ حد',
      unit: 'د اندازه کولو واحد',
      unitPrice: 'د یوه واحد بیه (افغانۍ)',
      status: 'د زېرمې حالت',
      supplier: 'برابرونکی (تدارکات)',
      healthy: 'زېرمه کافي او ښه ده',
      lowStock: 'د خلاصېدو په حال کې',
      criticalStock: 'بیړنۍ پېرلو ته اړتیا لري',
      reorderBtn: 'د زېرمې ډکول',
      unitCost: 'د پېرلو بیه',
    },
    crm: {
      title: 'د پېرودونکو او وفادارۍ اداره (CRM)',
      subtitle: 'د مراجعینو شالید، د لیدنو شمېر، د رانیولو ټولیز لګښت او ځانګړي تخفیفونه',
      addNewCustomer: 'د نوي پېرودونکي ثبت',
      customerName: 'د پېرودونکي نوم او تخلص',
      phoneNumber: 'د اړیکې شمېره',
      totalVisits: 'د مراجعې شمېر',
      totalSpent: 'ټولیز اخیستل شوي خواړه',
      loyaltyPoints: 'د وفادارۍ نمرې',
      customerTier: 'د غړیتوب کچه',
      lastVisitDate: 'د وروستۍ راتګ نېټه',
      vip: 'ځانګړی VIP مېلمه',
      regular: 'دايمي مېلمه',
      newCustomer: 'نوی مېلمه',
    },
    staff: {
      title: 'کارکوونکي، ویټران او کاري شیفتونه',
      subtitle: 'د سالون، پخلنځي او خزانې د کارکوونکو اداره او د حاضرۍ څار',
      addNewStaff: 'نوی کارکوونکی زیاتول',
      fullName: 'بشپړ نوم او تخلص',
      role: 'دنده او مسؤلیت',
      shift: 'کاري شیفت',
      phone: 'د ټلیفون شمېره',
      status: 'د حاضرۍ حالت',
      salary: 'میاشتنی معاش (AFN)',
      active: 'په دنده کې حاضر',
      offDuty: 'شیفت پای ته رسېدلی / رخصت',
      morningShift: 'د سهار شیفت (۰۸:۰۰ تر ۱۶:۰۰)',
      nightShift: 'د ماښام او شپې شیفت (۱۶:۰۰ تر ۲۴:۰۰)',
      fullDayShift: 'پوره ورځ',
      employeeName: 'د کارکوونکي نوم',
      employeeCode: 'د کارکوونکي کوډ',
      phoneNumber: 'د ټلیفون شمېره',
      shiftTime: 'کاري شیفت',
      attendance: 'د حاضرۍ حالت',
      present: 'حاضر',
      absent: 'رخصت / غیرحاضر',
    },
    reports: {
      title: 'د رستورانت مالي او کاري راپورونه',
      subtitle: 'د ناخالص عاید، ورځني پلور، د تادیاتو د څرنګوالي او غوره خواړو کره تحلیل',
      todaySales: 'د نن ورځې ټولیز پلور',
      totalOrders: 'ثبت شوي ټول فرمایشونه',
      avgOrderValue: 'د هر فرمایش اوسط بیه',
      netProfit: 'تخمیني ناخالصه ګټه',
      popularDishes: 'د غوره او ډېر پلورل شوو خواړو نوبت',
      paymentMethodsBreakdown: 'د تادیاتو ډولونه',
      cashPayment: 'نغدې افغانۍ',
      cardPayment: 'د بانکي کارت ماشین',
      printReport: 'ورځنی راپور چاپ کړئ',
      exportExcel: 'ایکسل راپور (Excel Export)',
      grossProfit: 'عملیاتي ناخالصه ګټه',
      profitMargin: 'د ګټې کچه',
      avgTableTurnover: 'د میز د تبادلې اوسط',
      minutes: 'دقیقې',
      topSellingDishes: 'د نن ورځې ډېر پلورل شوي خواړه',
      excelExport: 'ایکسل ترلاسه کول',
    },
    devices: {
      title: 'په محلي شبکه کې د وصل وسایلو مدیریت',
      subtitle: 'د ویټر ټابلیټونو، د پخلنځي سکرینونو او د خزانې کمپیوټرونو څار',
      totalDevices: 'ټول پېژندل شوي وسایل',
      onlineDevices: 'فعال او وصل وسایل',
      offlineDevices: 'غیرفعال وسایل',
      deviceName: 'د وسیلې نوم او نښه',
      deviceType: 'د وسیلې بڼه',
      ipAddress: 'محلي IP پته',
      lastPing: 'وروستی ځواب (Ping)',
      status: 'د لاسرسي حالت',
      online: 'آنلاین او فعال',
      blocked: 'بند شوی',
      toggleBlock: 'د لاسرسي بدلول',
      broadcastNotice: 'ټولو ټابلیټونو ته ډله ییز پیغام استول',
      broadcastPlaceholder: 'عملیاتي خبرتیا دلته ولیکئ...',
      sendBroadcast: 'خبرتیا واستوئ',
    },
    splitBill: {
      title: 'د صورتحساب بېلول او د څوکیو لګښت (Split Bill)',
      subtitle: 'د مېلمنو د څوکیو له مخې لګښت جلا کول یا د خوښې پیسې ادا کول',
      bySeat: 'لومړۍ لاره: د څوکۍ او امر شویو خوړو له مخې اداینه',
      fullPayTitle: 'د ټول پاتې صورتحساب یوځای ادا کول',
      customAmount: 'دویمه لاره: خپله خوښه ټاکلې پیسې ورکول',
      paid: 'ورکړل شوي',
      remaining: 'پاتې پیسې',
      payShare: 'خپله برخه ادا کړئ',
      settledNotice: 'د دې مېز صورتحساب بشپړ ادا شو. مېز خلاص دی.',
      finishAndClose: 'ثبت او د مېز سپارل',
    },
    settings: {
      title: 'د سیسټم تنظیمات او د QR سټینډ چاپ',
      subtitle: 'د هویت جوړول، محلي وای‌فای، د سیسټم ژبه او د مېزونو بارکوډ سټینډونه',
      generalSettings: 'عمومي او د هویت تنظیمات',
      restaurantName: 'د رستورانت رسمي نوم',
      branchAddress: 'د څانګې پته',
      contactPhone: 'د رستورانت شمېره',
      currencySetting: 'د پیسو واحد',
      languageSetting: 'د سیسټم ژبه',
      systemLanguage: 'د سیسټم فعاله ژبه وټاکئ',
      selectLanguage: 'د ژبې بدلول دری، پښتو یا انګلیسي ته سمدستي ټولې پاڼې او مینو هماهنګ کوي.',
      wifiQrSection: 'د وای‌فای او هوښیار QR بارکوډ تنظیمات',
      wifiSsid: 'د مېلمه د وای‌فای نوم (SSID)',
      wifiPassword: 'د وای‌فای پټ نوم (پاسورډ)',
      printTableCards: 'د میزونو د سټینډ چاپول',
      backupAndRestore: 'د ډیټابیس خوندي کولو کاپي',
      downloadBackup: 'د بشپړ بیک اپ کښته کول (JSON)',
      saveChanges: 'پر محلي سرور بدلونونه ثبت کړئ',
    },
  },
  en: {
    restaurantTitle: 'Aria Grill Restaurant',
    localSystem: 'Local-First POS System',
    connectedLocal: 'Local LAN Online',
    searchPlaceholder: 'Search table, order, customer...',
    todayLabel: 'Today, Local Server',
    localServerActive: 'Local Server Active',
    operationsAlerts: 'Operational Alerts',
    unreadCount: 'unread messages',
    switchRole: 'Switch System Role',
    currency: 'AFN',
    afn: 'AFN',
    common: {
      save: 'Save Changes',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      print: 'Print Receipt',
      search: 'Search...',
      filter: 'Filter by category',
      export: 'Export Excel/PDF',
      refresh: 'Refresh',
      close: 'Close',
      back: 'Back',
      add: 'Add New',
      all: 'All Items',
      status: 'Status',
      actions: 'Actions',
      notes: 'Notes & Instructions',
      price: 'Price',
      details: 'Details',
      success: 'Operation completed successfully',
      error: 'Error saving data',
      active: 'Active',
      inactive: 'Inactive',
      total: 'Total',
      subtotal: 'Subtotal',
      discount: 'Discount',
      tax: 'Tax & VAT',
      quantity: 'Qty',
      person: 'Guests',
      minutes: 'min',
      yes: 'Yes',
      no: 'No',
    },
    sections: {
      operations: 'Dining Floor & Sales',
      foodInventory: 'Menu & Stock Inventory',
      customersStaff: 'CRM & Staffing',
      systemReports: 'System & Reports',
    },
    nav: {
      dashboard: 'Dashboard',
      tables: 'Tables & Floor',
      waiter: 'Waiter Tablet App',
      pos: 'Checkout & POS',
      orders: 'Live Orders',
      kds: 'Kitchen Display (KDS)',
      menu: 'Menu & Pricing',
      inventory: 'Inventory Stock',
      customers: 'Customers & CRM',
      staff: 'Staff & Shifts',
      reports: 'Financial Reports',
      devices: 'Device Management',
      settings: 'Settings & WiFi QR',
    },
    roles: {
      MANAGER: { title: 'General Manager', badge: 'Full Access' },
      WAITER: { title: 'Floor Waiter', badge: 'Tables & Orders' },
      CASHIER: { title: 'Cashier / POS', badge: 'Checkout & Bills' },
      KITCHEN: { title: 'Head Chef / KDS', badge: 'Cooking Queue' },
      CUSTOMER: { title: 'Table Guest', badge: 'QR Mobile App' },
    },
    dashboard: {
      title: 'Restaurant Operations Command Center',
      subtitle: 'Live performance metrics today • Local sync: 1 min ago',
      floorMap: 'Floor Map',
      newOrderPos: '+ New Order (POS)',
      grossSalesToday: 'Gross Sales Today',
      comparedToNormal: 'Compared to typical weekday average',
      settledInvoices: 'Settled Invoices',
      avgPerInvoice: 'Average ticket size',
      tableOccupancy: 'Table Occupancy Rate',
      occupiedOutOf: 'tables currently dining',
      occupiedRate: 'occupied',
      lowStockAlerts: 'Low Stock Alerts',
      healthyStock: 'Inventory levels are optimal',
      criticalLow: 'items at critical reorder point',
      activeLiveOrders: 'Active Live Orders',
      viewAllOrders: 'View All Orders',
      tableCol: 'Table / Num',
      itemsCol: 'Ordered Items',
      timeCol: 'Time',
      totalCol: 'Total',
      statusCol: 'Status',
      quickActions: 'Quick Navigation',
      quickPOS: 'Cashier POS',
      quickPOSDesc: 'Create orders and process cash/card settlements',
      quickTables: 'Floor Map',
      quickTablesDesc: 'Monitor table occupancy and seat guests',
      quickKDS: 'Kitchen Display (KDS)',
      quickKDSDesc: 'Chef cooking queues and station monitors',
      quickReports: 'Financial Reports',
      quickReportsDesc: 'Profit breakdown, peak hours, and export',
      bestSellersToday: 'Top Selling Dishes Today',
      salesCount: 'portions sold',
      localServerSync: 'Local Server Active & Synced',
    },
    tables: {
      title: 'Floor Layout & Table Management',
      subtitle: 'Real-time occupancy status, active guest tickets, and table QR code generation',
      allSections: 'All Dining Sections',
      mainHall: 'Main Dining Hall',
      familySection: 'Family Section',
      terrace: 'Open Terrace',
      vipSection: 'VIP & Banquet Hall',
      allStatuses: 'All Statuses',
      available: 'Available Table',
      occupied: 'Occupied / Dining',
      reserved: 'Reserved',
      cleaning: 'Needs Cleaning',
      seats: 'Seats',
      personCapacity: 'Seating Capacity',
      openNewOrder: 'Start New Order',
      viewActiveOrder: 'View Active Bill & Items',
      printTableQr: 'Print Table QR Stand',
      changeStatus: 'Manual Status Change',
      clearAndClean: 'Settle & Mark for Cleaning',
      guestName: 'Guest',
      elapsedTime: 'Dwell Time',
      totalAmount: 'Current Total',
    },
    waiter: {
      title: 'Floor Waiter Tablet Application',
      subtitle: 'Rapid table order entry, live guest assistance requests, and direct kitchen dispatch',
      activeTablesList: 'Active Tables on Floor',
      guestCallsAndAlerts: 'Live Guest Call Alerts',
      noActiveCalls: 'No active assistance requests at this moment',
      requestWater: 'Water Bottle Request',
      requestBread: 'Warm Bread Refill',
      requestBill: 'Bill Request at Table',
      callWaiter: 'Waiter Call',
      sendToKitchen: 'Send Order to Kitchen (KDS)',
      orderItems: 'Table Order Items',
      addItem: 'Add Dish / Drink',
      seatNumber: 'Seat Number',
      orderNotes: 'Special Instructions (No onion, spicy, etc.)',
      specialInstructions: 'Chef Cooking Notes',
      markDelivered: 'Delivered',
      urgentBadge: 'Urgent',
    },
    pos: {
      title: 'Checkout Point of Sale (POS)',
      subtitle: 'Fast menu selection, automatic tax/discount, cash, card, and bill splitting',
      searchDishPlaceholder: 'Search dish name or code...',
      allCategories: 'All Categories',
      currentOrderCart: 'Current Order Cart',
      emptyCartNotice: 'No items selected in cart',
      seatLabel: 'Seat',
      allSeats: 'Entire Table',
      discountAmount: 'Discount',
      taxAmount: 'Tax / VAT (0%)',
      grandTotal: 'Total Payable',
      paymentMethod: 'Payment Method',
      cash: 'Cash (AFN Notes)',
      card: 'Bank Card Reader (POS)',
      splitBill: 'Split the Bill',
      settleAndInvoice: 'Settle & Print Receipt',
      printKitchenTicket: 'Print Kitchen Ticket',
      tableSelection: 'Select Table',
      customerSelection: 'Customer Profile (Optional)',
      cashReceived: 'Cash Received',
      cashChange: 'Change Due',
    },
    orders: {
      title: 'Live & Active Orders',
      subtitle: 'Real-time tracking of cooking, dispatch, and settlement across the local LAN',
      filterByStatus: 'Filter by Status',
      orderId: 'Order ID',
      table: 'Table',
      guest: 'Guest / Customer',
      items: 'Items',
      amount: 'Total Amount',
      placedTime: 'Placed Time',
      orderStatus: 'Cooking & Service Status',
      actions: 'Actions',
      pending: 'Queued for Kitchen',
      cooking: 'Cooking on Grill/Stove',
      ready: 'Ready for Service',
      served: 'Delivered to Table',
      paid: 'Settled & Paid',
      cancelled: 'Cancelled',
    },
    kds: {
      title: 'Kitchen Display System (KDS)',
      subtitle: 'Order management partitioned by Grill, Local Afghan, Fast Food, and Drink stations',
      allStations: 'All Kitchen Stations',
      grillStation: 'Kebab & Charcoal Grill',
      localStation: 'Traditional Afghan (Pulao, Mantu)',
      fastfoodStation: 'Fast Food & Pizza',
      drinksStation: 'Beverage Bar',
      dessertStation: 'Tea & Desserts',
      pendingCook: 'Pending Queue',
      inProgress: 'Cooking in Progress',
      readyToServe: 'Ready for Waiter Pickup',
      startCooking: 'Start Cooking',
      completeDish: 'Mark Dish Ready',
      elapsedTime: 'Elapsed Time',
      orderNote: 'Kitchen Note',
      seatNote: 'Seat',
      stationActive: 'Active Station',
    },
    menu: {
      title: 'Menu Items & Price Management',
      subtitle: 'Add and edit recipes, assign kitchen stations, manage availability, and review margins',
      addNewDish: 'Add New Menu Item',
      dishName: 'Dish Name',
      category: 'Category',
      price: 'Price (AFN)',
      station: 'Kitchen Prep Station',
      isAvailable: 'Availability Status',
      availableBadge: 'Available on Menu',
      outOfStockBadge: 'Out of Stock',
      rating: 'Guest Rating Score',
      description: 'Ingredients and recipe description',
      editDishTitle: 'Edit Dish Details',
      itemName: 'Dish Name',
    },
    inventory: {
      title: 'Inventory & Raw Ingredients',
      subtitle: 'Monitor stock levels for lamb, basmati rice, ghee, saffron with automatic low alerts',
      addNewStock: 'Record New Stock Inward',
      itemName: 'Item / Ingredient Name',
      currentQuantity: 'In Stock',
      minQuantity: 'Reorder Level',
      unit: 'Unit of Measure',
      unitPrice: 'Unit Cost (AFN)',
      status: 'Stock Health',
      supplier: 'Supplier',
      healthy: 'Optimal Stock Level',
      lowStock: 'Low Stock Level',
      criticalStock: 'Critical - Reorder Urgently',
      reorderBtn: 'Replenish Stock',
      unitCost: 'Unit Cost',
    },
    crm: {
      title: 'Customer Relationship & Loyalty (CRM)',
      subtitle: 'Customer database, visit frequency, lifetime spend, and loyalty discount points',
      addNewCustomer: 'Register New Customer',
      customerName: 'Customer Full Name',
      phoneNumber: 'Phone Number',
      totalVisits: 'Total Visits',
      totalSpent: 'Lifetime Spend',
      loyaltyPoints: 'Loyalty Points',
      customerTier: 'Membership Tier',
      lastVisitDate: 'Last Visit Date',
      vip: 'VIP Guest',
      regular: 'Regular Customer',
      newCustomer: 'New Customer',
    },
    staff: {
      title: 'Staff, Waiters & Work Shifts',
      subtitle: 'Manage dining room waiters, kitchen chefs, and cashiers with real-time shift monitoring',
      addNewStaff: 'Add Staff Member',
      fullName: 'Full Name',
      role: 'Staff Role',
      shift: 'Assigned Shift',
      phone: 'Phone Number',
      status: 'Current Status',
      salary: 'Monthly Salary (AFN)',
      active: 'On Duty in Restaurant',
      offDuty: 'Off Shift / Leave',
      morningShift: 'Morning Shift (08:00 - 16:00)',
      nightShift: 'Evening/Night Shift (16:00 - 24:00)',
      fullDayShift: 'Full Day Shift',
      employeeName: 'Staff Member Name',
      employeeCode: 'Staff ID Code',
      phoneNumber: 'Phone Number',
      shiftTime: 'Work Shift',
      attendance: 'Attendance Status',
      present: 'On Duty',
      absent: 'Off Duty / Leave',
    },
    reports: {
      title: 'Financial & Operational Reports',
      subtitle: 'Gross revenue analysis, daily sales, payment tender breakdown, and top dishes',
      todaySales: 'Gross Sales Today',
      totalOrders: 'Total Orders Placed',
      avgOrderValue: 'Average Order Value',
      netProfit: 'Estimated Gross Profit',
      popularDishes: 'Best Selling Dishes',
      paymentMethodsBreakdown: 'Payment Method Breakdown',
      cashPayment: 'Cash Tender (AFN)',
      cardPayment: 'Bank Card / POS',
      printReport: 'Print Daily Report',
      exportExcel: 'Export to Excel (CSV/XLS)',
      grossProfit: 'Operating Gross Profit',
      profitMargin: 'Profit Margin',
      avgTableTurnover: 'Average Table Turnover',
      minutes: 'min',
      topSellingDishes: 'Top Selling Dishes Today',
      excelExport: 'Export to Excel',
    },
    devices: {
      title: 'Connected Local Network Terminals',
      subtitle: 'Monitor waiter tablets, kitchen KDS monitors, and cashier terminals on local LAN',
      totalDevices: 'Total Paired Devices',
      onlineDevices: 'Online Devices',
      offlineDevices: 'Offline Devices',
      deviceName: 'Device Name / Label',
      deviceType: 'Terminal Type',
      ipAddress: 'Local IP Address',
      lastPing: 'Last Response (Ping)',
      status: 'Network Status',
      online: 'Online & Active',
      blocked: 'Access Blocked',
      toggleBlock: 'Toggle Access Permission',
      broadcastNotice: 'Broadcast Alert to All Tablets',
      broadcastPlaceholder: 'Enter urgent operational notice...',
      sendBroadcast: 'Dispatch Notification',
    },
    splitBill: {
      title: 'Bill Settlement & Seat Splitting (Split Bill)',
      subtitle: 'Itemize bill by guest seats or pay custom amounts per individual',
      bySeat: 'Method 1: Pay by Seat & Ordered Items',
      fullPayTitle: 'Settle Entire Remaining Balance',
      customAmount: 'Method 2: Pay Custom Flexible Amount',
      paid: 'Paid',
      remaining: 'Remaining',
      payShare: 'Pay Share',
      settledNotice: 'This table bill has been fully settled. Table is ready for turnover.',
      finishAndClose: 'Complete & Clear Table',
    },
    settings: {
      title: 'System Settings & Table QR Stand Station',
      subtitle: 'Configure restaurant identity, local WiFi credentials, language, and table print stands',
      generalSettings: 'General Restaurant Identity',
      restaurantName: 'Official Restaurant Name',
      branchAddress: 'Branch Address',
      contactPhone: 'Contact Phone Number',
      currencySetting: 'Default Currency',
      languageSetting: 'System Localization',
      systemLanguage: 'Select Active System Language',
      selectLanguage: 'Switching language to Dari, Pashto, or English instantly localizes all screens and menus.',
      wifiQrSection: 'WiFi Configuration & Smart QR Printing',
      wifiSsid: 'Guest WiFi SSID',
      wifiPassword: 'WiFi Password (WPA2)',
      printTableCards: 'Preview & Print Table Stands',
      backupAndRestore: 'Database Backup & Restore',
      downloadBackup: 'Download Full Database Backup (JSON)',
      saveChanges: 'Save Configuration on Local Server',
    },
  },
};
