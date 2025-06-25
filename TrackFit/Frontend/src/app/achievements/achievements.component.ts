import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss'],
})
export class AchievementsComponent implements OnInit {
  @Input() username: string | null = null; // übergebener Benutzername (wenn in external profile aufgerufen)
  logedusername: string | null = ''; // Benutzername des eingeloggten Benutzers

  // Datenstruktur zur Speicherung der für die Erfolge relevanten Aktivitätsdaten
  data: {
    activitytype: string;
    totaldistanceMet: number;
  }[] = [];

  // Gruppierte Erfolge nach Aktivitätstypen
  achievementGroups: {
    type: string; // gemäß activitytype
    achievements: {
      target: number;
      cumulative: boolean;
      achieved: boolean;
      icon: string; // Icon-Pfad
    }[];
  }[] = [];

  // Labels für Singular- und Pluralformen der Aktivitäten im Tooltip
  labels: { [key: string]: { singular: string; plural: string } } = {
    Spazieren: { singular: 'einem Spaziergang.', plural: 'allen Spaziergängen.' },
    Laufen: { singular: 'einem Lauf.', plural: 'allen Läufen.' },
    Wandern: { singular: 'einer Wanderung.', plural: 'allen Wanderungen.' },
    Radfahren: { singular: 'einer Radtour.', plural: 'allen Radtouren.' },
  };


  constructor(private http: HttpClient) {}


  ngOnInit(): void {
    // Hole den Benutzernamen des eingeloggten Nutzers aus dem SessionStorage
    this.logedusername = sessionStorage.getItem('username');

    // Falls ein Benutzername übergeben wurde, wird dieser verwendet, andernfalls der eingeloggte Benutzername
    const targetUsername = this.username || this.logedusername;

    // ist ein gültiger Benutzername vorhanden, sollen entsprechend seine Aktivitätsdaten abgerufen werden
    if (targetUsername) {
      this.getActivitiesByUsername(targetUsername);
    }
  }

  // Methode zum Abruf der Aktivitäten des jeweiligen Benutzers
  getActivitiesByUsername(username: string): void {
    // API-Endpunkt mit dem angegebenen Benutzernamen
    this.http
      .get<any[]>(`http://localhost:8080/api/v1/activity/by-username?username=${username}`)
      .subscribe({
        next: (response) => {
          // Speichere die erhaltenen Aktivitäten
          this.data = response;

          // Berechne die Erfolge basierend auf den Aktivitäten
          this.calculateAchievements();
        },
        error: (error) => {
          console.error('Fehler beim Abrufen der Aktivitäten:', error);
        },
      });
  }

  // Berechnung der Erfolge für die jeweiligen Aktivitäten
  // Definition der Einzelerfolg- und kumuliertem Erfolgsgrenzwerte jedes Aktivitätstyps
  // Zuweisung der Pokal-Icons nach Erfolg und Typ:Bronze für den kleinen Einzelerfolg, Silber für den großen Einzelerfolg, Gold für den kumulierten Erfolg
  calculateAchievements(): void {
    const distances: Record<string, { single: number[]; total: number; icons: string[] }> = {
      Spazieren: {
        single: [2000, 5000],
        total: 100000,
        icons: [
          'assets/icons/spazieren_bronze.png',
          'assets/icons/spazieren_silber.png',
          'assets/icons/spazieren_gold.png',
        ],
      },
      Laufen: {
        single: [5000, 10000],
        total: 50000,
        icons: [
          'assets/icons/laufen_bronze.png',
          'assets/icons/laufen_silber.png',
          'assets/icons/laufen_gold.png',
        ],
      },
      Wandern: {
        single: [10000, 20000],
        total: 100000,
        icons: [
          'assets/icons/wandern_bronze.png',
          'assets/icons/wandern_silber.png',
          'assets/icons/wandern_gold.png',
        ],
      },
      Radfahren: {
        single: [50000, 100000],
        total: 500000,
        icons: [
          'assets/icons/radfahren_bronze.png',
          'assets/icons/radfahren_silber.png',
          'assets/icons/radfahren_gold.png',
        ],
      },
    };

    // Initialisierung der kumulierten Aktivitätstypendistanzen
    const cumulativeDistances: Record<string, number> = {
      Spazieren: 0,
      Laufen: 0,
      Wandern: 0,
      Radfahren: 0,
    };

    // gruppiert die Erfolge in Arrays mit entsprechenden Attributen wie Zielwert, Zieltyp, Icon und Status gemäß Aktivitästyp
    const groupedAchievements: Record<
      string, { target: number; cumulative: boolean; achieved: boolean; icon: string }[]  > = {};

    //Liste von Erfolgen für jeden Aktivitätstyp aufgeteilt in Einzel- und kumulierte Erfolge
    Object.keys(distances).forEach((type) => {
      groupedAchievements[type] = [
        ...distances[type].single.map((target, index) => ({
          target, // Zielwert für einzelne Aktivität
          cumulative: false,
          achieved: false,
          icon: distances[type].icons[index],
        })),
        {
          target: distances[type].total,
          cumulative: true,
          achieved: false,
          icon: distances[type].icons[distances[type].icons.length - 1],
        },
      ];
    });

    // Aktualisiert die kumulierten Distanzen basierend auf den Aktivitäten
    this.data.forEach((activity) => {
      const type = activity.activitytype; // Aktivitätstyp der jeweiligen Aktivität
      const distance = activity.totaldistanceMet; // Distanz der jeweiligen Aktivität

      // Kumulation der Distanz aufgeteilt nach Aktivitätstyp
      if (cumulativeDistances[type] !== undefined) {
        cumulativeDistances[type] += distance;
      }

      // Setzung des Erreichtstatus beim Erreichen der Ziele
      groupedAchievements[type]?.forEach((achievement) => {
        if (achievement.cumulative && cumulativeDistances[type] >= achievement.target) {
          achievement.achieved = true;
        } else if (!achievement.cumulative && distance >= achievement.target) {
          achievement.achieved = true;
        }
      });
    });

    // Konvertiert Erfolge (mitsamt Aktivitätstyp, Zielwerten, Status und Icon) in ein Array für die Darstellung in der html
    this.achievementGroups = Object.keys(groupedAchievements).map((type) => ({
      type,
      achievements: groupedAchievements[type],
    }));
  }

  // Methode für das Fallback-Pokal-Icon
  fallbackImage(event: Event): void {
    const imgElement = event.target as HTMLImageElement; // HTML-Element des fehlerhaften Bildes
    imgElement.src = 'assets/icons/achieve.png'; // Standard-Fallback-Icon
  }
}
