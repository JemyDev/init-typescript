import { Response, Request } from 'express';
import * as sqlite from 'sqlite3';
import { Controller } from '../decorators/controller';
import { Get, Post, Patch } from '../decorators/route';
import { Employee } from '../models/types/employee';
import { EmployeeRepository } from '../models/repositories/employeeRepository';
import { Keys } from '../keys';
import { Inject } from '../decorators/inject';
import { TeamRepository } from '../models/repositories/teamRepository';

@Controller()
class EmployeeController {
  private readonly employeeRepository: EmployeeRepository;
  private readonly teamRepository: TeamRepository;

  constructor(
    @Inject(Keys.employeeRepository)
    employeeRepository: EmployeeRepository,
    @Inject(Keys.teamRepository)
    teamRepository: TeamRepository
  ) {
    this.employeeRepository = employeeRepository;
    this.teamRepository = teamRepository;
  }

  @Get()
  async getAll(req: Request, res: Response) {
    const employees = await this.employeeRepository.getAll();

    res.json(employees);
  }

  @Post()
  async post(req: Request, res: Response) {
    if (this.isEmployee(req.body)) {
      if (this.isValid(req.body)) {
        const exists = await this.employeeRepository.exists(req.body.email);
        if (!exists) {
          await this.employeeRepository.insert(req.body);
          res.sendStatus(200);
        } else {
          res.status(400).json({
            message: 'Email already exists',
          });
        }
      } else {
        res.status(400).json({
          message: 'Employee data validation failed',
        });
      }
    } else {
      res.status(400).json({
        message: 'Request body is not an Employee',
      });
    }
  }

  @Patch(':employeeId/team/:teamId')
  async changeTeam(req: Request, res: Response) {
    const { employeeId, teamId } = req.params;

    if (this.isIdentifier(employeeId) && this.isIdentifier(teamId)) {
      const exists = await this.teamRepository.exists(parseInt(teamId));
      if (exists) {
        await this.employeeRepository.changeTeam(
          parseInt(employeeId),
          parseInt(teamId),
        );
        res.sendStatus(200);
      } else {
        res.status(400).json({
          message: 'Team does not exists',
        });
      }
    } else {
      res.status(400).json({
        message: 'Invalid identifier',
      });
    }
  }

  private isEmployee(value: any): value is Employee {
    return (
      value.firstName &&
      value.lastName &&
      value.email
    );
  }

  private isValid(employee: Employee) {
    return (
      employee.firstName.length &&
      employee.lastName.length &&
      /^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$/
      .test(employee.email)
    );
  }

  private isIdentifier(value: string) {
    return /^\d+$/.test(value);
  }
};