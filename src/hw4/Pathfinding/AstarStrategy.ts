import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
import GraphUtils from "../../Wolfie2D/Utils/GraphUtils";
import EdgeNode from "../../Wolfie2D/DataTypes/Graphs/EdgeNode";


// TODO Construct a NavigationPath object using A* -- done

/**
 * The AstarStrategy class is an extension of the abstract NavPathStrategy class. For our navigation system, you can
 * now specify and define your own pathfinding strategy. Originally, the two options were to use Djikstras or a
 * direct (point A -> point B) strategy. The only way to change how the pathfinding was done was by hard-coding things
 * into the classes associated with the navigation system. 
 * 
 * - Peter
 */
export default class AstarStrategy extends NavPathStrat {

    /**
     * @see NavPathStrat.buildPath()
     */
    public buildPath(to: Vec2, from: Vec2): NavigationPath {
        let g = this.mesh.graph;
		let pathStack = new Stack<Vec2>(g.numVertices);
        let pre: Array<number> = new Array(g.numVertices);
        let visited = new Set<number>();
        let gValue = new Array<number>(g.numVertices);
        let hValue = new Array<number>(g.numVertices);
        
        let start = g.snap(from);
		let end = g.snap(to);
        let v: number = start; // current vertex

        // Push the final position in the graph to the stack
		pathStack.push(to.clone());
		pathStack.push(g.positions[end]);

        // initilize arrays
        gValue.fill(-1);
        hValue.fill(-1);

        // begin at start vertex
        gValue[start] = 0;
        hValue[start] = this.getHValue(g.positions[start], g.positions[end]);
        visited.add(start);

        while(visited.size !== 0) {
            let d: Array<number> = new Array(); // distance from v to its neighbors
            v = Array.from(visited).sort((v1, v2) => gValue[v1] + hValue[v1] - gValue[v2] - hValue[v2])[0];
            if (v === end) {
                break;
            }
            visited.delete(v);

            // get the list of neighbors of v
            let n: Array<number> = new Array();
            let p: EdgeNode = g.edges[v];
            
            while(p !== undefined && p !== null) {
                let w = p.y;
                n.push(w);
                d[w] = 10;
                p = p.next;
            }
            if(n.includes(v - 1) && n.includes(v - 64)) {
                let w = v - 65;
                n.push(w);
                d[w] = 14;
            }
            if(n.includes(v + 1) && n.includes(v - 64)) {
                let w = v - 63;
                n.push(w);
                d[w] = 14;
            }
            if(n.includes(v - 1) && n.includes(v + 64)) {
                let w = v + 63;
                n.push(w);
                d[w] = 14;
            }
            if(n.includes(v + 1) && n.includes(v + 64)) {
                let w = v + 65;
                n.push(w);
                d[w] = 14;
            }

            for(let u of n) {
                let temp_g = gValue[v] + d[u];
                if(temp_g < gValue[u] || gValue[u] === -1) {
                    gValue[u] = temp_g;
                    pre[u] = v;
                    if(!visited.has(u)) {
                        visited.add(u);
                    }
                }
            }
        }

        // push the path to the stack
        v = end;
        while(pre[v] !== start) {
            v = pre[v];
            pathStack.push(g.positions[v]);
        }

        return new NavigationPath(pathStack);
    }

    getHValue(v1: Vec2, v2: Vec2): number {
        return ((Math.abs(v1.x - v2.x) + Math.abs(v1.y - v2.y)) / 8) * 10;
    }
    
}