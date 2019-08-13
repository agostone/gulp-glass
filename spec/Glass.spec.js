'use strict';

require('jasmine-expect');

const glassFile = require.resolve('../Glass');
const {basename} = require('path');

describe('agna-gulp-glass', function () {

    let Glass;

    // Unloading gulp & glass
    beforeEach(function () {
        delete require.cache[glassFile];
        delete require.cache[require.resolve('gulp')];

        Glass = require('../Glass');
    });

    it('should load tasks in directory taskPath1', function () {
        let glass = new Glass(__dirname + '/taskPath1');
        const gulp = glass.loadTasks();

        const tasks = gulp._registry.tasks();
        const taskNames = Object.getOwnPropertyNames(tasks);
        expect(taskNames.length).toBe(2);

        taskNames.forEach((taskName) => {
            const task = require(`${__dirname}/taskPath1/${taskName}`);

            expect(tasks[taskName]).toBeFunction();
            expect(tasks[taskName].unwrap()).toBe(task);
        });
    });

    it('should load task files matching the pattern \'*.task.js\' in directory taskPath1 and taskPath2', function () {
        let glass = new Glass({
            taskPaths: [`${__dirname}/taskPath1`, `${__dirname}/taskPath2`],
            filePattern: '**/*.task.js'
        });
        const gulp = glass.loadTasks();

        const tasks = gulp._registry.tasks();
        const taskNames = Object.getOwnPropertyNames(tasks);
        expect(taskNames.length).toBe(2);

        taskNames.forEach((taskName) => {
            expect(tasks[taskName]).toBeFunction();
            expect(typeof tasks[taskName].unwrap() === 'function').toBeTruthy();
            expect(taskName.indexOf('.task') > 0).toBeTruthy();
        });
    });

    it('should load task(s) according to the defined sort function', function () {
        let glass = new Glass({
            taskPaths: `${__dirname}/taskSort`,
            sort: (first, second) => {
                const f = basename(first).charCodeAt(0);
                const t = basename(second).charCodeAt(0);
                return f < t
                    ? 1
                    : f > t
                        ? -1
                        : 0;
            }
        });

        const gulp = glass.loadTasks();
        const tasks = Object.getOwnPropertyNames(gulp._registry.tasks());
        expect(tasks.length).toBe(3);
        expect(tasks[0]).toBe('test1');
        expect(tasks[1]).toBe('test2');
        expect(tasks[2]).toBe('default');
    });

    it('should name task(s) according to the name resolver', function () {
        let glass = new Glass({
            taskPaths: `${__dirname}/taskPath1`,
            nameResolver: (file) => basename(file)[0],
            filePattern: '**/*.task.js'
        });
        const gulp = glass.loadTasks();
        const tasks = Object.getOwnPropertyNames(gulp._registry.tasks());
        expect(tasks.length).toBe(1);
        expect(tasks[0]).toBe('t');
    });
});
