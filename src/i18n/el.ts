export const el = {
  // Navigation / Sidebar
  nav: {
    dashboard: 'Επισκόπηση',
    requests: 'Αιτήματα',
    parishioners: 'Μητρώο',
    sacraments: 'Μυστήρια',
    finances: 'Οικονομικά',
    documents: 'Πρωτόκολλο',
    calendar: 'Πρόγραμμα',
    philanthropy: 'Φιλόπτωχο',
    assets: 'Περιουσιολόγιο',
    diptychs: 'Δίπτυχα',
    settings: 'Ρυθμίσεις',
    audit: 'Ιστορικό Ενεργειών',
    subscription: 'Συνδρομές',
    superAdmin: 'Super Admin',
    logout: 'Αποσύνδεση',
    sectionManagement: 'Διαχείριση',
    sectionSystem: 'Σύστημα'
  },
  
  // Login Page
  login: {
    title: 'Σύνδεση',
    subtitle: 'Εισάγετε τα στοιχεία του λογαριασμού σας',
    emailLabel: 'Email',
    emailPlaceholder: 'email@example.gr',
    passwordLabel: 'Κωδικός',
    passwordPlaceholder: '••••••••',
    forgotPassword: 'Ξεχάσατε;',
    submitButton: 'Είσοδος',
    loading: 'Είσοδος...',
    noAccount: 'Δεν έχετε λογαριασμό;',
    contactUs: 'Επικοινωνήστε μαζί μας'
  },

  // General App 
  general: {
    appName: 'Κανόνας'
  }
}

export type Dictionary = typeof el
