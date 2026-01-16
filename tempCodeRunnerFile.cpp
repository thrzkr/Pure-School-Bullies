#include <iostream>
#include <vector>
#include <cstdlib>
#include <ctime>

using namespace std;

struct Unit {
    int x, y;
    int health;
    int damage;
    int owner; // 0 for player, 1 for AI
};

struct Tile {
    char terrain; // 'G' for grass, 'M' for mountain, 'W' for water
};

class Game {
private:
    static const int MAP_SIZE = 10;
    Tile map[MAP_SIZE][MAP_SIZE];
    vector<Unit> units;
    int turn;
    int playerGold;
    int aiGold;

public:
    Game() : turn(0), playerGold(100), aiGold(100) {
        initializeMap();
        spawnStartingUnits();
    }

    void initializeMap() {
        srand(time(0));
        for (int i = 0; i < MAP_SIZE; i++) {
            for (int j = 0; j < MAP_SIZE; j++) {
                int rand_val = rand() % 10;
                if (rand_val < 6) map[i][j].terrain = 'G';
                else if (rand_val < 8) map[i][j].terrain = 'M';
                else map[i][j].terrain = 'W';
            }
        }
    }

    void spawnStartingUnits() {
        units.push_back({1, 1, 20, 5, 0});
        units.push_back({MAP_SIZE - 2, MAP_SIZE - 2, 20, 5, 1});
    }

    void displayMap() {
        cout << "\n=== Turn " << turn << " | Player Gold: " << playerGold << " | AI Gold: " << aiGold << " ===\n";
        for (int i = 0; i < MAP_SIZE; i++) {
            for (int j = 0; j < MAP_SIZE; j++) {
                Unit* unit = getUnitAt(i, j);
                if (unit) cout << (unit->owner == 0 ? 'P' : 'A');
                else cout << map[i][j].terrain;
                cout << " ";
            }
            cout << "\n";
        }
    }

    Unit* getUnitAt(int x, int y) {
        for (auto& u : units) {
            if (u.x == x && u.y == y) return &u;
        }
        return nullptr;
    }

    void playerTurn() {
        displayMap();
        cout << "\nSelect unit (0): ";
        int unitIdx;
        cin >> unitIdx;
        
        if (unitIdx >= units.size() || units[unitIdx].owner != 0) {
            cout << "Invalid unit!\n";
            return;
        }

        cout << "Enter move direction (0=up, 1=right, 2=down, 3=left): ";
        int dir;
        cin >> dir;
        moveUnit(unitIdx, dir);
    }

    void moveUnit(int idx, int direction) {
        int dx[] = {-1, 0, 1, 0};
        int dy[] = {0, 1, 0, -1};
        
        units[idx].x += dx[direction];
        units[idx].y += dy[direction];
        
        units[idx].x = max(0, min(units[idx].x, MAP_SIZE - 1));
        units[idx].y = max(0, min(units[idx].y, MAP_SIZE - 1));
    }

    void aiTurn() {
        for (auto& u : units) {
            if (u.owner == 1) {
                int dir = rand() % 4;
                u.x += (dir == 0 ? -1 : (dir == 1 ? 1 : 0));
                u.y += (dir == 2 ? -1 : (dir == 3 ? 1 : 0));
                u.x = max(0, min(u.x, MAP_SIZE - 1));
                u.y = max(0, min(u.y, MAP_SIZE - 1));
            }
        }
    }

    void update() {
        turn++;
        playerGold += 10;
        aiGold += 10;
    }

    void run() {
        while (playerGold > 0 && aiGold > 0) {
            playerTurn();
            aiTurn();
            update();
        }
        cout << "\nGame Over!\n";
    }
};

int main() {
    Game game;
    game.run();
    return 0;
}